package models

type Post struct {
	ID      uint   `json:"id" gorm:"primary_key"`
	Author  uint   `json:"author"`
	Thread  uint   `json:"thread"`
	Content string `json:"content"`
}

type CreatePostInput struct {
	Author  uint   `json:"author" binding:"required"`
	Thread  uint   `json:"thread"`
	Content string `json:"content" binding:"required"`
}

type UpdatePostInput struct {
	Content string `json:"content"`
}
