package models

import "gorm.io/gorm"

type Post struct {
	gorm.Model
	ID      uint   `json:"id" gorm:"primary_key"`
	Author  string `json:"author"`
	Tags    []Tag  `gorm:"many2many:post_tags;" json:"tags"`
	Content string `json:"content"`
	Email   string `json:"email"`
}

type Tag struct {
	gorm.Model
	Name  string `json:"name"`
	Color string `json:"color"`
}

type CreatePostInput struct {
	Author  string
	Content string   `json:"content" binding:"required"`
	Tags    []string `json:"tags"`
	Email   string
}

type UpdatePostInput struct {
	Content string   `json:"content"`
	Tags    []string `json:"tags"`
}
