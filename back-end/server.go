package main

import (
	"encoding/json"
	"log"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/itchyny/gojq"
)

type JqRequest struct {
	Filter     string `json:"filter"`
	SourceJson any    `json:"sourceJson"`
}

func main() {
	app := fiber.New(fiber.Config{
		BodyLimit: 10 * 1024 * 1024,
	})

	limitMiddleware := limiter.New(limiter.Config{
		Max:        100,
		Expiration: 15 * time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Too many requests, please try again later.",
			})
		},
	})

	app.Get("/api/hello", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "Hello from backend"})
	})

	app.Post("/api/jq", limitMiddleware, func(c *fiber.Ctx) error {
		var req JqRequest

		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
		}

		if req.Filter == "" || len(req.Filter) > 1000 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid or too long filter"})
		}

		switch req.SourceJson.(type) {
		case map[string]any, []any:
		default:
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid source JSON"})
		}

		query, err := gojq.Parse(req.Filter)
		if err != nil {
			log.Printf("Query parse error: %v", err)
			return c.Status(fiber.StatusInternalServerError).SendString("An exception occurred")
		}

		iter := query.Run(req.SourceJson)

		var results []any

		for {
			v, ok := iter.Next()
			if !ok {
				break
			}
			if err, ok := v.(error); ok {
				log.Printf("gojq execution error: %v", err)
				return c.Status(fiber.StatusInternalServerError).SendString("An exception occurred")
			}
			results = append(results, v)
		}

		var finalOutput any
		if len(results) == 1 {
			finalOutput = results[0]
		} else {
			finalOutput = results
		}

		finalJson, err := json.MarshalIndent(finalOutput, "", "  ")
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Error formatting JSON")
		}

		c.Set("Content-Type", "application/json; charset=utf-8")
		return c.Send(finalJson)
	})

	app.Static("/", filepath.Join("..", "front-end", "dist"))

	log.Println("Server is listening on 0.0.0.0:3000 ...")
	log.Fatal(app.Listen("0.0.0.0:3000"))
}
