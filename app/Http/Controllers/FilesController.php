<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FilesController extends Controller
{
    /**
     * Stream file private via signed URL.
     */
    public function show(Request $request, string $path): StreamedResponse|Response
    {
        abort_unless($request->hasValidSignature(), 403, 'Tautan tidak valid atau kedaluwarsa.');

        $disk = Storage::disk('local');

        abort_unless($disk->exists($path), 404, 'File tidak ditemukan.');

        return $disk->download($path);
    }
}
