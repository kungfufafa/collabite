<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Food & Beverage',
            'Fashion',
            'Beauty & Personal Care',
            'Travel & Hospitality',
            'Tech & Gadget',
            'Lifestyle',
            'Kesehatan',
            'Pendidikan',
            'Otomotif',
            'Properti',
        ];

        foreach ($categories as $name) {
            Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'description' => 'Kategori konten '.$name]
            );
        }
    }
}
