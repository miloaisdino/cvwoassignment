package models

type Post struct {
	ID      uint   `json:"id" gorm:"primary_key"`
	Author  string `json:"author"`
	Thread  uint   `json:"thread"`
	Content string `json:"content"`
}

type CreatePostInput struct {
	Author  string `json:"author" binding:"required"`
	Content string `json:"content" binding:"required"`
	Thread  uint   `json:"thread"`
}

type UpdatePostInput struct {
	Content string `json:"content"`
}
