package main

import (
	"backend/controllers"
	"github.com/gin-gonic/gin"

	"backend/auth"
	"backend/models"

	"github.com/gin-contrib/cors"
	_ "github.com/joho/godotenv/autoload"
)

func main() {
	r := gin.Default()

	// Enable CORS middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localtest.me:3000"} // You can replace "*" with specific origins
	config.AllowCredentials = true
	r.Use(cors.New(config))

	models.ConnectDatabase() // new
	authy := auth.Provider(r)

	r.GET("/posts", controllers.GetPosts)
	r.GET("/posts/:id", controllers.FindPost)
	r.POST("/posts", authy, controllers.CreatePost)
	r.PATCH("/posts/:id", authy, controllers.UpdatePost)
	r.DELETE("/posts/:id", authy, controllers.DeletePost)

	err := r.Run()
	if err != nil {
		return
	}
}
