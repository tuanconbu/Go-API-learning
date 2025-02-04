package controllers

import (
	"context"
	"log"

	"github.com/gin-gonic/gin/binding"

	db "api/database"
	models "api/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetNewestRates(c *gin.Context) {
	cubeCollection := db.Connector
	var Cubes []models.Cubes
	var dateCubes models.DateCube
	data, _ := cubeCollection.Find(context.Background(), bson.M{})
	defer data.Close(context.Background())
	error := data.All(context.Background(), &Cubes)
	if error != nil {
		log.Fatal(error)
	}

	rateResult := make(map[string]float64)
	allCubes := make([]models.DateCube, 0)
	for _, cubes := range Cubes {
		dateCubes.Date = cubes.Time
		for _, cube := range cubes.Cubes {
			rateResult[cube.Currency] = cube.Rate

			dateCubes.Rates = rateResult
		}
		allCubes = append(allCubes, dateCubes)
	}

	c.JSON(http.StatusOK, allCubes[0])
}

func GetRandomRates(c *gin.Context) {
	cubeCollection := db.Connector
	var time models.Time
	if err := c.ShouldBindBodyWith(&time, binding.JSON); err != nil {
		log.Printf("%+v", err)
	}
	if time.Time != "" {
		var Cubes []models.Cubes
		var DateCubes models.DateCube
		data, _ := cubeCollection.Find(context.Background(), bson.M{"time": time.Time})
		defer data.Close(context.Background())
		error := data.All(context.Background(), &Cubes)
		if error != nil {
			log.Fatal(error)
		}
		rateResult := make(map[string]float64)
		for _, cubes := range Cubes {
			DateCubes.Date = cubes.Time
			for _, cube := range cubes.Cubes {
				rateResult[cube.Currency] = cube.Rate

				DateCubes.Rates = rateResult
			}
		}
		c.JSON(http.StatusOK, DateCubes)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pass body please"})
	}

}

func GetPropertyOfAll(c *gin.Context) {
	cubeCollection := db.Connector
	matchStage := bson.M{"$unwind": "$Cube"}
	groupStage := bson.M{
		"$group": bson.M{
			"_id": "$Cube.currency",
			"max": bson.M{
				"$max": "$Cube.rate",
			},
			"min": bson.M{
				"$min": "$Cube.rate",
			},
			"avg": bson.M{
				"$avg": "$Cube.rate",
			}},
	}
	getDataCubeCusor, err := cubeCollection.Aggregate(context.Background(), []bson.M{matchStage, groupStage})
	if err != nil {
		panic(err)
	}
	var getDataCube []models.ValuePerCurrency
	if err = getDataCubeCusor.All(context.Background(), &getDataCube); err != nil {
		panic(err)
	}
	c.JSON(http.StatusOK, getDataCube)
}
