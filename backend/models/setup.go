package models

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"os"
)

var DB *gorm.DB

func ConnectDatabase() {

	dsn := os.Getenv("DB_URI")
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		panic("Failed to connect to database!")
	}

	err = database.AutoMigrate(&Post{})
	if err != nil {
		return
	}

	err = database.AutoMigrate(&User{})
	if err != nil {
		return
	}

	DB = database
}
