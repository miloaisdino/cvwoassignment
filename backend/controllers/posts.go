package controllers

import (
	jwt "github.com/appleboy/gin-jwt/v2"
	"log"
	"math/rand"
	"net/http"

	"backend/models"
	"github.com/gin-gonic/gin"
)

// GetPosts GET /posts
// Get all posts
func GetPosts(c *gin.Context) {
	var posts []models.Post
	claims := jwt.ExtractClaims(c)
	//models.DB.Find(&posts)
	if err := models.DB.Preload("Tags").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}
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
		Email:   claims["email"].(string),
	}
	// Create or update tags
	for _, tagStr := range input.Tags {
		tag := models.Tag{
			Name:  tagStr,
			Color: getRandomColor(),
		}
		models.DB.FirstOrCreate(&tag, tag)
		post.Tags = append(post.Tags, tag)
	}
	log.Println(post)
	models.DB.Create(&post)

	c.JSON(http.StatusOK, gin.H{"data": post})
}

func getRandomColor() string {
	// Your implementation to generate a random color
	// For simplicity, you can use a predefined list of colors
	colors := []string{"#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c"}
	return colors[rand.Intn(len(colors))]
}

// FindPost GET /posts/:id
// Fetch a post
func FindPost(c *gin.Context) {
	var post models.Post

	if err := models.DB.Preload("Tags").Where("id = ?", c.Param("id")).First(&post).Error; err != nil {
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

	//Update content
	//models.DB.Model(&post).Updates(input)
	models.DB.Model(&post).Updates(models.Post{
		Content: input.Content,
	})

	// Update tags
	var updatedTags []models.Tag
	for _, tagName := range input.Tags {
		tag := models.Tag{
			Name:  tagName,
			Color: getRandomColor(),
		}
		models.DB.FirstOrCreate(&tag, tag)
		updatedTags = append(updatedTags, tag)
	}

	// Update the post's tags
	err := models.DB.Model(&post).Association("Tags").Replace(updatedTags)
	if err != nil {
		return
	}

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
