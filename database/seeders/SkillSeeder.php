<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            'Photography',
            'Videography',
            'Copywriting',
            'Social Media',
            'Video Editing',
            'Graphic Design',
            'Motion Graphics',
            'Voice Over',
            'SEO',
            'Influencer Marketing',
        ];

        foreach ($skills as $name) {
            Skill::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        }
    }
}
