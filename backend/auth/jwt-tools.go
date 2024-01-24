package auth

import (
	"fmt"
	"github.com/golang-jwt/jwt/v5"
)

func parseAndVerifyJWT(tokenString, secretKey string) (*jwt.Token, error) {
	// Parse the token without verifying the signature
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Check the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		// Return the secret key for verification
		return []byte(secretKey), nil
	})

	// Check for parsing errors
	if err != nil {
		return nil, fmt.Errorf("Error parsing JWT: %v", err)
	}

	// Check if the token is valid
	if !token.Valid {
		return nil, fmt.Errorf("Invalid token")
	}

	return token, nil
}
