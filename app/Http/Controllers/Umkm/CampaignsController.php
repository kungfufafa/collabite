<?php

declare(strict_types=1);

namespace App\Http\Controllers\Umkm;

use App\Actions\Campaign\CancelCampaignAction;
use App\Actions\Campaign\CreateCampaignAction;
use App\Actions\Campaign\PublishCampaignAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Umkm\StoreCampaignRequest;
use App\Http\Requests\Umkm\UpdateCampaignRequest;
use App\Models\Campaign;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignsController extends Controller
{
    public function index(Request $request): Response
    {
        $umkm = $request->user()->umkmProfile()->firstOrFail();
        $campaigns = $umkm->campaigns()
            ->withCount(['collaborationRequests', 'collaboration'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Umkm/Campaigns/Index', [
            'campaigns' => $campaigns->through(fn (Campaign $c): array => [
                'id' => $c->id,
                'title' => $c->title,
                'status' => $c->status->value,
                'status_label' => $c->status->label(),
                'budget' => $c->budget,
                'deadline' => $c->deadline?->toDateString(),
                'is_hidden' => $c->is_hidden,
                'pending_requests' => $c->collaboration_requests_count,
                'has_collaboration' => $c->collaboration_count > 0,
                'created_at' => $c->created_at->toDateTimeString(),
            ]),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Umkm/Campaigns/Form', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'campaign' => null,
        ]);
    }

    public function store(StoreCampaignRequest $request, CreateCampaignAction $action): RedirectResponse
    {
        $umkm = $request->user()->umkmProfile()->firstOrFail();
        $campaign = $action->execute($umkm, $request->validated());

        return redirect()->route('umkm.campaigns.show', $campaign)->with('status', 'Campaign berhasil dibuat.');
    }

    public function show(Request $request, Campaign $campaign): Response
    {
        $this->authorize('view', $campaign);
        $campaign->load(['category', 'deliverables', 'collaborationRequests.creator', 'collaboration']);

        return Inertia::render('Umkm/Campaigns/Show', [
            'campaign' => [
                'id' => $campaign->id,
                'title' => $campaign->title,
                'description' => $campaign->description,
                'status' => $campaign->status->value,
                'status_label' => $campaign->status->label(),
                'budget' => $campaign->budget,
                'deadline' => $campaign->deadline?->toDateString(),
                'is_hidden' => $campaign->is_hidden,
                'category' => $campaign->category?->name,
                'deliverables' => $campaign->deliverables->map(fn ($d): array => [
                    'id' => $d->id,
                    'title' => $d->title,
                    'description' => $d->description,
                    'quantity' => $d->quantity,
                ]),
                'requests' => $campaign->collaborationRequests->map(fn ($r): array => [
                    'id' => $r->id,
                    'type' => $r->type->value,
                    'status' => $r->status->value,
                    'creator_name' => $r->creator->name,
                    'message' => $r->message,
                    'responded_at' => $r->responded_at?->toDateTimeString(),
                ]),
                'collaboration_id' => $campaign->collaboration?->id,
            ],
        ]);
    }

    public function edit(Request $request, Campaign $campaign): Response
    {
        $this->authorize('update', $campaign);
        $campaign->load('deliverables');

        return Inertia::render('Umkm/Campaigns/Form', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'campaign' => [
                'id' => $campaign->id,
                'title' => $campaign->title,
                'description' => $campaign->description,
                'category_id' => $campaign->category_id,
                'budget' => $campaign->budget,
                'deadline' => $campaign->deadline?->toDateString(),
                'deliverables' => $campaign->deliverables->map(fn ($d): array => [
                    'title' => $d->title,
                    'description' => $d->description,
                    'quantity' => $d->quantity,
                ]),
            ],
        ]);
    }

    public function update(UpdateCampaignRequest $request, Campaign $campaign): RedirectResponse
    {
        $this->authorize('update', $campaign);
        $data = $request->validated();

        $campaign->fill([
            'title' => $data['title'],
            'description' => $data['description'],
            'category_id' => $data['category_id'],
            'budget' => $data['budget'] ?? null,
            'deadline' => $data['deadline'] ?? null,
        ]);
        $campaign->save();

        $campaign->deliverables()->delete();
        foreach (($data['deliverables'] ?? []) as $del) {
            if (empty($del['title'])) {
                continue;
            }
            $campaign->deliverables()->create([
                'title' => $del['title'],
                'description' => $del['description'] ?? null,
                'quantity' => $del['quantity'] ?? 1,
            ]);
        }

        return redirect()->route('umkm.campaigns.show', $campaign)->with('status', 'Campaign diperbarui.');
    }

    public function publish(Request $request, Campaign $campaign, PublishCampaignAction $action): RedirectResponse
    {
        $this->authorize('update', $campaign);
        $action->execute($campaign);

        return back()->with('status', 'Campaign dipublikasikan.');
    }

    public function cancel(Request $request, Campaign $campaign, CancelCampaignAction $action): RedirectResponse
    {
        $this->authorize('update', $campaign);
        $action->execute($campaign);

        return back()->with('status', 'Campaign dibatalkan.');
    }
}
