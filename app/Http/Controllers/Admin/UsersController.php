<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\AccountStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Models\User;
use App\Notifications\AccountStatusChangedNotification;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin: list pengguna, suspend/activate.
 */
class UsersController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $query = User::query()->with('umkmProfile', 'creatorProfile');

        $role = $request->query('role');
        $status = $request->query('status');
        $keyword = trim((string) $request->query('q', ''));

        if ($role) {
            $query->where('role', $role);
        }
        if ($status) {
            $query->where('account_status', $status);
        }
        if ($keyword !== '') {
            $query->where(function ($builder) use ($keyword): void {
                $builder->where('name', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%");
            });
        }

        $users = $query->latest()->paginate(20)->withQueryString();
        $users->setCollection(
            $users->getCollection()->map(fn (User $u): array => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role->value,
                'role_label' => $u->role->label(),
                'account_status' => $u->account_status->value,
                'created_at' => $u->created_at->toDateTimeString(),
            ]),
        );

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'role' => $role,
                'status' => $status,
                'q' => $keyword !== '' ? $keyword : null,
            ],
        ]);
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);
        if ($user->is($request->user())) {
            return back()->withErrors(['user' => 'Admin tidak dapat mengubah status akun sendiri.']);
        }

        $data = $request->validated();
        $previousStatus = $user->account_status->value;
        $newStatus = AccountStatus::from($data['account_status']);
        $reason = $data['reason'] ?? null;

        DB::transaction(function () use ($user, $request, $newStatus, $previousStatus, $reason): void {
            $user->update(['account_status' => $newStatus]);

            app(AuditLogger::class)->log(
                $request->user(),
                $newStatus === AccountStatus::Suspended ? 'account.suspended' : 'account.activated',
                $user->fresh(),
                [
                    'previous_status' => $previousStatus,
                    'new_status' => $newStatus->value,
                    'reason' => $reason,
                ],
            );
        });

        $user->notify(new AccountStatusChangedNotification($newStatus, $reason));

        return back()->with('status', 'Status akun diperbarui.');
    }
}
