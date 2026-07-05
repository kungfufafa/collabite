<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);
        if ($user->is($request->user())) {
            return back()->withErrors(['user' => 'Admin tidak dapat mengubah status akun sendiri.']);
        }

        $data = $request->validate([
            'account_status' => ['required', 'string', 'in:active,suspended'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $user->update(['account_status' => $data['account_status']]);

        return back()->with('status', 'Status akun diperbarui.');
    }
}
