package models

type Post struct {
	ID      uint   `json:"id" gorm:"primary_key"`
	Author  string `json:"author"`
	Thread  uint   `json:"thread"`
	Content string `json:"content"`
	Email   string `json:"email"`
}

type CreatePostInput struct {
	Author  string
	Content string `json:"content" binding:"required"`
	Thread  uint   `json:"thread"`
	Email   string
}

type UpdatePostInput struct {
	Content string `json:"content"`
}
