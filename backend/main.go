package main

import (
	"backend/controllers"
	"github.com/gin-gonic/gin"
	"os"

	"backend/auth"
	"backend/models"

	"github.com/gin-contrib/cors"
	_ "github.com/joho/godotenv/autoload"
)

func main() {
	r := gin.Default()

	// Enable CORS middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{os.Getenv("FRONTEND_URI")} // You can replace "*" with specific origins
	config.AllowCredentials = true
	r.Use(cors.New(config))

	models.ConnectDatabase() // new
	authy := auth.Provider(r)

	r.GET("/posts", authy, controllers.GetPosts)
	r.POST("/posts", authy, controllers.CreatePost)

	r.GET("/posts-read", controllers.GetPosts)

	r.GET("/posts/:id", controllers.FindPost)
	r.PATCH("/posts/:id", authy, controllers.UpdatePost)
	r.DELETE("/posts/:id", authy, controllers.DeletePost)

	r.GET("/admin/data", authy, controllers.GetAdminData)
	r.PATCH("/admin/data", authy, controllers.UpdateAdminData)

	err := r.Run()
	if err != nil {
		return
	}
}
