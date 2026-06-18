<?php

declare(strict_types=1);

namespace App\Http\Controllers\Umkm;

use App\Http\Controllers\Controller;
use App\Http\Requests\Umkm\ProductRequest;
use App\Models\Product;
use App\Models\UmkmProfile;
use App\Services\FileUrlService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductsController extends Controller
{
    public function __construct(private readonly FileUrlService $files) {}

    public function index(Request $request): Response
    {
        $umkm = $this->umkm($request);

        return Inertia::render('Umkm/Products/Index', [
            'products' => $umkm->products()
                ->latest()
                ->get()
                ->map(fn (Product $p): array => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'description' => $p->description,
                    'price' => $p->price,
                    'is_active' => $p->is_active,
                    'image_url' => $p->image_path ? $this->files->publicUrl($p->image_path) : null,
                ]),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $umkm = $this->umkm($request);

        DB::transaction(function () use ($request, $umkm): void {
            $data = $request->validated();
            $product = $umkm->products()->create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'price' => $data['price'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            if ($request->hasFile('image')) {
                $product->image_path = $this->files->storePublic($request->file('image'), 'products', $product->id);
                $product->save();
            }
        });

        return back()->with('status', 'Produk berhasil ditambahkan.');
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $this->authorizeProduct($request, $product);

        DB::transaction(function () use ($request, $product): void {
            $data = $request->validated();
            $product->fill([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'price' => $data['price'] ?? null,
                'is_active' => $data['is_active'] ?? $product->is_active,
            ]);

            if ($request->hasFile('image')) {
                $this->files->delete($product->image_path, 'public');
                $product->image_path = $this->files->storePublic($request->file('image'), 'products', $product->id);
            }

            $product->save();
        });

        return back()->with('status', 'Produk berhasil diperbarui.');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeProduct($request, $product);
        $this->files->delete($product->image_path, 'public');
        $product->delete();

        return back()->with('status', 'Produk berhasil dihapus.');
    }

    private function umkm(Request $request): UmkmProfile
    {
        return $request->user()->umkmProfile()->firstOrFail();
    }

    private function authorizeProduct(Request $request, Product $product): void
    {
        abort_unless($product->umkm_profile_id === $this->umkm($request)->id, 403);
    }
}
