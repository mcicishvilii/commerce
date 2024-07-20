<?php
// backend/src/Router.php

namespace App;

use GraphQL\GraphQL;
use GraphQL\Error\DebugFlag;

class Router
{
    public function handleRequest()
    {
        try {
            $uri = $_SERVER['REQUEST_URI'];
            $method = $_SERVER['REQUEST_METHOD'];

            // Handle the root URL and other frontend routes
            if ($uri === '/' || strpos($uri, '/product/') === 0) {
                return $this->serveReactApp();
            }

            // Handle GraphQL requests
            if ($uri === '/graphql' && $method === 'POST') {
                $data = json_decode(file_get_contents('php://input'), true);
                return $this->handleGraphQL($data);
            }

            // If no routes match, return a 404 error
            http_response_code(404);
            return ['error' => 'Not Found'];
        } catch (\Exception $e) {
            error_log("Uncaught exception: " . $e->getMessage());
            http_response_code(500);
            return ['error' => 'Internal Server Error: ' . $e->getMessage()];
        }
    }

    private function serveReactApp()
    {
        // Serve your React app's index.html file
        $indexFile = __DIR__ . '/../public/index.html';
        if (file_exists($indexFile)) {
            header('Content-Type: text/html');
            readfile($indexFile);
            exit;
        } else {
            http_response_code(404);
            return ['error' => 'React app not found'];
        }
    }

    private function handleGraphQL($data)
    {
        try {
            $schema = \App\GraphQL\Schema::buildSchema();
            $query = $data['query'] ?? '';
            $variables = $data['variables'] ?? null;

            $result = GraphQL::executeQuery($schema, $query, null, null, $variables);
            $output = $result->toArray(DebugFlag::INCLUDE_DEBUG_MESSAGE | DebugFlag::INCLUDE_TRACE);

            return $output;
        } catch (\Exception $e) {
            error_log("GraphQL error: " . $e->getMessage());
            return [
                'errors' => [
                    [
                        'message' => 'An error occurred while processing the GraphQL request: ' . $e->getMessage(),
                    ]
                ]
            ];
        }
    }
}