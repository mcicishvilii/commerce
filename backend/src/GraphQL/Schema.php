<?php
// backend/src/GraphQL/Schema.php

namespace App\GraphQL;

use GraphQL\Type\Schema as GraphQLSchema;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\InputObjectType;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductGallery;

class Schema
{
    private static $categoryType = null;

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
                'price' => [
                    'type' => Type::float(),
                    'resolve' => function ($product) {
                        $priceModel = new \App\Models\Price();
                        $price = $priceModel->getForProduct($product['id']);
                        return $price ? $price['amount'] : null;
                    }
                ],
                'currency' => [
                    'type' => Type::string(),
                    'resolve' => function ($product) {
                        $priceModel = new \App\Models\Price();
                        $price = $priceModel->getForProduct($product['id']);
                        return $price ? $price['currency_label'] : null;
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
            'mutation' => new ObjectType([
                'name' => 'Mutation',
                'fields' => [
                    'placeOrder' => [
                        'type' => Type::boolean(),
                        'args' => [
                            'items' => Type::nonNull(Type::listOf(Type::nonNull(new InputObjectType([
                                'name' => 'OrderItem',
                                'fields' => [
                                    'productId' => Type::nonNull(Type::int()),
                                    'quantity' => Type::nonNull(Type::int()),
                                    'options' => Type::string()
                                ]
                            ]))))
                        ],
                        'resolve' => function ($root, $args) {
                            $order = new \App\Models\Order();
                            return $order->create($args['items']);
                        }
                    ]
                ]
            ])
        ]);
    }

    private static function categoryType()
    {
        if (self::$categoryType === null) {
            self::$categoryType = new ObjectType([
                'name' => 'Category',
                'fields' => [
                    'id' => Type::int(),
                    'name' => Type::string(),
                ]
            ]);
        }
        return self::$categoryType;
    }
}