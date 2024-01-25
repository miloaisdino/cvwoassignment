package controllers

import (
	jwt "github.com/appleboy/gin-jwt/v2"
	"log"
	"net/http"

	"backend/models"
	"github.com/gin-gonic/gin"
)

// GetPosts GET /posts
// Get all posts
func GetPosts(c *gin.Context) {
	var posts []models.Post
	claims := jwt.ExtractClaims(c)
	models.DB.Find(&posts)
	for k, post := range posts {
		if claims["email"] == nil || post.Email != claims["email"].(string) {
			post.Email = ""
		} //redact non-self emails
		posts[k] = post
	}
	c.JSON(http.StatusOK, gin.H{"data": posts})
}

// CreatePost POST /posts
// Create new post
func CreatePost(c *gin.Context) {
	claims := jwt.ExtractClaims(c)
	// Validate input
	var input models.CreatePostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create post
	post := models.Post{
		Author:  claims["name"].(string),
		Content: input.Content,
		//Thread:  input.Thread,
		Thread: 0,
		Email:  claims["email"].(string),
	}
	log.Println(claims)
	models.DB.Create(&post)

	c.JSON(http.StatusOK, gin.H{"data": post})
}

// FindPost GET /posts/:id
// Fetch a post
func FindPost(c *gin.Context) {
	var post models.Post

	if err := models.DB.Where("id = ?", c.Param("id")).First(&post).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": post})
}

// UpdatePost PATCH /posts/:id
// Update a post
func UpdatePost(c *gin.Context) {
	// Get model if exist
	var post models.Post
	if err := models.DB.Where("id = ?", c.Param("id")).First(&post).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		return
	}

	// Validate input
	var input models.UpdatePostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	models.DB.Model(&post).Updates(input)

	c.JSON(http.StatusOK, gin.H{"data": post})
}

// DeletePost DELETE /posts/:id
// Delete a post
func DeletePost(c *gin.Context) {
	var post models.Post
	if err := models.DB.Where("id = ?", c.Param("id")).First(&post).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		return
	}

	models.DB.Delete(&post)

	c.JSON(http.StatusOK, gin.H{"data": true})
}
