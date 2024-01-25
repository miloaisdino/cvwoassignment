package auth

import (
	"backend/models"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/gplus"
	"gorm.io/gorm"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	jwt2 "github.com/golang-jwt/jwt/v5"
	"github.com/markbates/goth/gothic"
)

type login struct {
	Username string `form:"username" json:"username" binding:"required"`
	Password string `form:"password" json:"password" binding:"required"`
}

var identityKey = "email"

func helloHandler(c *gin.Context) {
	claims := jwt.ExtractClaims(c)
	user, _ := c.Get(identityKey)
	c.JSON(200, gin.H{
		"userID": claims[identityKey],
		"Name":   user.(*User).Name,
		"claims": claims,
	})
}

func meHandler(c *gin.Context) {
	claims := jwt.ExtractClaims(c)
	c.JSON(200, gin.H{
		"data": claims,
	})
}

type User struct {
	Email string
	Name  string
	dp    string
}

var store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_SECRET")))

func Provider(r *gin.Engine) gin.HandlerFunc {
	isProd := false // Set to true when serving over https

	store.MaxAge(60 * 5) //give 5 mins to complete sso
	store.Options.Path = "/"
	store.Options.HttpOnly = false // HttpOnly should always be enabled
	store.Options.Secure = isProd

	gothic.Store = store
	// the jwt middleware
	authMiddleware, err := jwt.New(&jwt.GinJWTMiddleware{
		Realm:       "auth",
		Key:         []byte(os.Getenv("SESSION_SECRET")),
		Timeout:     time.Hour,
		MaxRefresh:  time.Hour,
		IdentityKey: identityKey,
		PayloadFunc: func(data interface{}) jwt.MapClaims {
			if v, ok := data.(*User); ok {
				return jwt.MapClaims{
					identityKey: v.Email,
					"name":      v.Name,
					"dp":        v.dp,
				}
			}
			return jwt.MapClaims{}
		},
		IdentityHandler: func(c *gin.Context) interface{} {
			claims := jwt.ExtractClaims(c)
			return &User{
				Email: claims[identityKey].(string),
				Name:  claims["name"].(string),
				dp:    claims["dp"].(string),
			}
		},
		Authenticator: func(c *gin.Context) (interface{}, error) {
			var loginVals login
			if err := c.ShouldBind(&loginVals); err != nil {
				return "", jwt.ErrMissingLoginValues
			}
			userID := loginVals.Username
			password := loginVals.Password

			if userID == "sso" {
				tokenString := password                  // Replace with your actual JWT token
				secretKey := os.Getenv("SESSION_SECRET") // Replace with your actual secret key

				token, err := parseAndVerifyJWT(tokenString, secretKey)
				if err != nil {
					fmt.Println("Error:", err)
					return nil, jwt.ErrFailedAuthentication
				}

				// Access token claims
				claims, ok := token.Claims.(jwt2.MapClaims)
				if !ok {
					fmt.Println("Error parsing claims")
					return nil, jwt.ErrFailedAuthentication
				}

				return &User{
					Email: claims["email"].(string),
					Name:  claims["name"].(string),
					dp:    claims["dp"].(string),
				}, nil
			}

			return nil, jwt.ErrFailedAuthentication
		},
		Authorizator: func(data interface{}, c *gin.Context) bool {
			//check for admin and banned status here
			/*if v, ok := data.(*User); ok && v.Email == "admin" {
				return true
			}*/
			v, _ := data.(*User)
			var user models.User

			// Start a database transaction
			tx := models.DB.Begin()

			// Check if the user with the specified email already exists
			err := tx.Where("email = ?", v.Email).First(&user).Error
			if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				// Handle the error
				tx.Rollback()
				return true
			}

			// If the user does not exist, create a new user
			if errors.Is(err, gorm.ErrRecordNotFound) {
				user = models.User{
					Email:    v.Email,
					IsAdmin:  false,
					IsBanned: false,
				}
				if err := tx.Save(&user).Error; err != nil {
					// Handle the error
					tx.Rollback()
					//return err
				}
			}

			// Commit the transaction
			if err := tx.Commit().Error; err != nil {
				// Handle the error
				tx.Rollback()
				//return err
			}

			//to check dbRow for banned status

			return true //for now
		},
		Unauthorized: func(c *gin.Context, code int, message string) {
			c.JSON(code, gin.H{
				"code":    code,
				"message": message,
			})
			c.Abort()
		},
		LoginResponse: func(c *gin.Context, code int, token string, t time.Time) {
			_, err := c.Cookie("jwt")
			if err != nil {
				log.Println(err)
			}
			c.Redirect(http.StatusFound, "http://localtest.me:3000/posts")
			/*c.JSON(http.StatusOK, gin.H{
				"code":    http.StatusOK,
				"token":   token,
				"expire":  t.Format(time.RFC3339),
				"message": "login successfully",
				"cookie":  cookie,
			})*/
		},

		TokenLookup:   "header: Authorization, query: token, cookie: jwt",
		TokenHeadName: "Bearer",
		TimeFunc:      time.Now,

		SendCookie:     true,
		SecureCookie:   false, //non HTTPS dev environments
		CookieHTTPOnly: false,
		CookieDomain:   os.Getenv("COOKIE_DOMAIN"),
		CookieName:     "jwt",
		CookieSameSite: http.SameSiteLaxMode, //SameSiteDefaultMode, SameSiteLaxMode, SameSiteStrictMode, SameSiteNoneMode
	})
	if err != nil {
		log.Fatal("JWT Error:" + err.Error())
	}

	errInit := authMiddleware.MiddlewareInit()

	if errInit != nil {
		log.Fatal("authMiddleware.MiddlewareInit() Error:" + errInit.Error())
	}

	r.POST("/login", authMiddleware.LoginHandler)
	r.GET("/logout", authMiddleware.LogoutHandler)

	r.NoRoute(authMiddleware.MiddlewareFunc(), func(c *gin.Context) {
		claims := jwt.ExtractClaims(c)
		log.Printf("NoRoute claims: %#v\n", claims)
		c.JSON(404, gin.H{"code": "PAGE_NOT_FOUND", "message": "Page not found"})
	})

	//does the redirect
	googleProvider := gplus.New(os.Getenv("GOOGLE_CLIENT_ID"), os.Getenv("GOOGLE_CLIENT_SECRET"), os.Getenv("GOOGLE_CALLBACK"))
	goth.UseProviders(googleProvider)

	r.GET("/login", func(c *gin.Context) {
		q := c.Request.URL.Query()
		q.Add("provider", "gplus")
		c.Request.URL.RawQuery = q.Encode()
		gothic.BeginAuthHandler(c.Writer, c.Request)
	})

	r.GET("/callback", func(c *gin.Context) {
		q := c.Request.URL.Query()
		q.Add("provider", "gplus")
		c.Request.URL.RawQuery = q.Encode()
		user, err := gothic.CompleteUserAuth(c.Writer, c.Request)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		jsonString, err := json.Marshal(user)
		log.Println(string(jsonString))
		var (
			key []byte
			t   *jwt2.Token
			s   string
		)
		key = []byte(os.Getenv("SESSION_SECRET"))
		t = jwt2.NewWithClaims(jwt2.SigningMethodHS256, jwt2.MapClaims{
			"email":   user.Email,
			"name":    user.Name,
			"dp":      user.AvatarURL,
			"expires": user.ExpiresAt,
		})
		s, _ = t.SignedString(key)

		formData := url.Values{
			"username": {"sso"},
			"password": {s},
		}
		// Perform router redirect with new request type and form data
		c.Request.URL.Path = "/login"
		c.Request.Method = "POST"
		c.Request.PostForm = formData
		r.HandleContext(c)
	})

	auth := r.Group("/auth")
	// Refresh time can be longer than token timeout
	auth.GET("/refresh_token", authMiddleware.RefreshHandler)
	auth.Use(authMiddleware.MiddlewareFunc())
	{
		auth.GET("/hello", helloHandler)
		auth.GET("/me", meHandler)
	}

	return authMiddleware.MiddlewareFunc()
}
