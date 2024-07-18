<?php
// backend/src/GraphQL/Schema.php

namespace App\GraphQL;

use GraphQL\Type\Schema as GraphQLSchema;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Definition\ObjectType;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductGallery;

class Schema
{
    public static function buildSchema()
    {
        $productType = new ObjectType([
            'name' => 'Product',
            'fields' => [
                'id' => Type::int(),
                'name' => Type::string(),
                'in_stock' => Type::boolean(),
                'description' => Type::string(),
                'brand' => Type::string(),
                'gallery' => [
                    'type' => Type::listOf(Type::string()),
                    'resolve' => function ($product) {
                        $productGallery = new ProductGallery();
                        $images = $productGallery->getImagesForProduct($product['id']);
                        return array_column($images, 'image_url');
                    }
                ],
                'category' => [
                    'type' => self::categoryType(),
                    'resolve' => function ($product) {
                        $category = new Category();
                        return $category->find($product['category_id']);
                    }
                ],
            ]
            
        ]);

        return new GraphQLSchema([
            'query' => new ObjectType([
                'name' => 'Query',
                'fields' => [
                    'products' => [
                        'type' => Type::listOf($productType),
                        'args' => [
                            'filter' => [
                                'type' => Type::string(),
                                'defaultValue' => null
                            ]
                        ],
                        'resolve' => function ($root, $args) {
                            $product = new Product();
                            if ($args['filter']) {
                                return $product->getByCategory($args['filter']);
                            }
                            return $product->all();
                        }
                    ],
                    'categories' => [
                        'type' => Type::listOf(self::categoryType()),
                        'resolve' => function () {
                            $category = new Category();
                            return $category->all();
                        }
                    ]
                ]
            ]),
            
        ]);
    }

    private static function categoryType()
    {
        return new ObjectType([
            'name' => 'Category',
            'fields' => [
                'id' => Type::int(),
                'name' => Type::string(),
            ]
        ]);
    }
}