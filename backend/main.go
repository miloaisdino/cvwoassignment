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
	config.AllowOrigins = []string{"*"} // You can replace "*" with specific origins
	r.Use(cors.New(config))

	models.ConnectDatabase() // new
	auth.Provider(r)

	r.GET("/posts", controllers.GetPosts)
	r.GET("/posts/:id", controllers.FindPost)
	r.POST("/posts", controllers.CreatePost)
	r.PATCH("/posts/:id", controllers.UpdatePost)
	r.DELETE("/posts/:id", controllers.DeletePost)

	err := r.Run()
	if err != nil {
		return
	}
}
