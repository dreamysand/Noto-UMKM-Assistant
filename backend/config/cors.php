<?php
return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'broadcasting/auth',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:4173',
    ],

    'allowed_headers' => ['*'],

    'supports_credentials' => true,
];
