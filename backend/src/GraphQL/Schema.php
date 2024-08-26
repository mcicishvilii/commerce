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
use App\Models\ProductAttribute;
use App\Models\ProductAttributeSet;

class Schema
{
    private static $categoryType = null;
    private static $productType = null;

    public static function buildSchema()
    {
        self::$productType = new ObjectType([
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
                'attributes' => [
                    'type' => Type::listOf(new ObjectType([
                        'name' => 'ProductAttribute',
                        'fields' => [
                            'id' => Type::int(),
                            'name' => Type::string(),
                            'type' => Type::string(),
                            'items' => Type::listOf(new ObjectType([
                                'name' => 'AttributeItem',
                                'fields' => [
                                    'displayValue' => Type::string(),
                                    'value' => Type::string(),
                                    'id' => Type::int(),
                                ]
                            ])),
                        ]
                    ])),
                    'resolve' => function ($product) {
                        $attributeSet = new ProductAttributeSet();
                        $attributes = $attributeSet->getForProduct($product['id']);
                        
                        // Add debug logging
                        error_log('Productasdasd ID: ' . $product['id']);
                        error_log('Attributesasdasd: ' . print_r($attributes, true));
                        
                        $result = [];
                        foreach ($attributes as $attribute) {
                            $attributeValues = new ProductAttribute();
                            $values = $attributeValues->getForAttributeSet($attribute['id']);
                            
                            // Add debug logging
                            error_log('Attribute IDasdasd: ' . $attribute['id']);
                            error_log('Attribute Valuesaadda: ' . print_r($values, true));
                            
                            $result[] = [
                                'id' => $attribute['id'],
                                'name' => $attribute['name'],
                                'type' => $attribute['type'],
                                'items' => array_map(function($value) {
                                    return [
                                        'displayValue' => $value['display_value'],
                                        'value' => $value['value'],
                                        'id' => $value['id'],
                                    ];
                                }, $values),
                            ];
                        }
                        
                        // Add final debug logging
                        error_log('Final Resultddd: ' . print_r($result, true));
                        
                        return $result;
                    }
                ],
            ]
        ]);

        return new GraphQLSchema([
            'query' => new ObjectType([
                'name' => 'Query',
                'fields' => [
                    'products' => [
                        'type' => Type::listOf(self::$productType),
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
                    'product' => [
                        'type' => self::$productType,
                        'args' => [
                            'id' => Type::nonNull(Type::int())
                        ],
                        'resolve' => function ($root, $args) {
                            $product = new Product();
                            return $product->find($args['id']);
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