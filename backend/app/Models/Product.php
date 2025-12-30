<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'stock',
        'price',
        'unit',
        'is_deleted',
        'client_updated_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
