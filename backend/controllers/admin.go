// controllers/admin.go
package controllers

import (
	"backend/auth"
	"backend/models"
	"github.com/gin-gonic/gin"
	"net/http"
)

// GetAdminData GET /admin/data
// Retrieve data for the admin table (banned users and admins)
func GetAdminData(c *gin.Context) {
	if auth.AdminCheck(c) != true {
		c.AbortWithError(http.StatusForbidden, gin.Error{})
	} else {
		var users []models.User

		if err := models.DB.Find(&users).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
			return
		}

		var adminData []map[string]interface{}
		for _, user := range users {
			adminData = append(adminData, map[string]interface{}{
				"id":      user.ID,
				"email":   user.Email,
				"banned":  user.IsBanned,
				"isAdmin": user.IsAdmin,
			})
		}

		c.JSON(http.StatusOK, gin.H{"data": adminData})
	}
}

// UpdateAdminData PATCH /admin/data
// Update admin data (banned status, admin status)
func UpdateAdminData(c *gin.Context) {
	if auth.AdminCheck(c) != true {
		c.AbortWithError(http.StatusForbidden, gin.Error{})
	} else {
		var adminData []map[string]interface{}
		if err := c.ShouldBindJSON(&adminData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		for _, data := range adminData {
			email := data["email"].(string)
			banned := data["banned"].(bool)
			isAdmin := data["isAdmin"].(bool)

			var user models.User
			if err := models.DB.Where("email = ?", email).First(&user).Error; err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User not found!"})
				return
			}

			// Update user data based on the checkboxes
			user.IsBanned = banned
			user.IsAdmin = isAdmin

			if err := models.DB.Save(&user).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
				return
			}
		}
		c.JSON(http.StatusOK, gin.H{"message": "Admin data updated successfully"})
	}
}
