package main

import (
	"backend/controllers"
	"github.com/gin-gonic/gin"

	"backend/auth"
	"backend/models"

	_ "github.com/joho/godotenv/autoload"
)

func main() {
	r := gin.Default()

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
