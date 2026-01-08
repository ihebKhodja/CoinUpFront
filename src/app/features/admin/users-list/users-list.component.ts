import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { AdminUsersService, AdminUserDto } from '../../../core/services/admin-users.service';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class AdminUsersListComponent implements OnInit {
  users: AdminUserDto[] = [];
  filteredUsers: AdminUserDto[] = [];

  searchQuery = '';
  loading = false;
  error: string | null = null;

  private readonly pendingIds = new Set<string>();

  constructor(private readonly usersService: AdminUsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.usersService.listUsers().subscribe({
      next: (users) => {
        this.users = Array.isArray(users) ? users : [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load users.';
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  isActionLoading(userId: string): boolean {
    return this.pendingIds.has(userId);
  }

  isSuspended(user: AdminUserDto): boolean {
    if (user.isSuspended != null) return !!user.isSuspended;
    if (user.isActive != null) return !user.isActive;
    if (user.status) return String(user.status).toLowerCase() === 'suspended';
    return false;
  }

  displayName(user: AdminUserDto): string {
    return user.username || user.email || user.id;
  }

  joinedDate(user: AdminUserDto): string {
    const value = user.joinedAt || user.createdAt;
    if (!value) return '-';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString();
  }

  roleLabel(user: AdminUserDto): string {
    return user.role || 'User';
  }

  async activate(user: AdminUserDto): Promise<void> {
    if (!user.id || this.isActionLoading(user.id)) return;

    const result = await Swal.fire({
      title: 'Activate account?'
      ,text: `Activate user "${this.displayName(user)}"?`
      ,icon: 'question'
      ,showCancelButton: true
      ,confirmButtonText: 'Activate'
      ,cancelButtonText: 'Cancel'
      ,reverseButtons: true
      ,focusCancel: true
    });
    if (!result.isConfirmed) return;

    this.pendingIds.add(user.id);
    this.usersService.setUserActive(user.id, true).subscribe({
      next: () => {
        user.status = 'Active';
        user.isSuspended = false;
        user.isActive = true;
        this.pendingIds.delete(user.id);
        this.applyFilter();

        void Swal.fire({
          title: 'Activated'
          ,text: `User "${this.displayName(user)}" is now active.`
          ,icon: 'success'
          ,timer: 1600
          ,showConfirmButton: false
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to activate user.';
        this.pendingIds.delete(user.id);
      },
    });
  }

  async suspend(user: AdminUserDto): Promise<void> {
    if (!user.id || this.isActionLoading(user.id)) return;

    const result = await Swal.fire({
      title: 'Suspend account?'
      ,text: `Suspend user "${this.displayName(user)}"?`
      ,icon: 'warning'
      ,showCancelButton: true
      ,confirmButtonText: 'Suspend'
      ,cancelButtonText: 'Cancel'
      ,reverseButtons: true
      ,focusCancel: true
      ,confirmButtonColor: '#ef4444'
    });
    if (!result.isConfirmed) return;

    this.pendingIds.add(user.id);
    this.usersService.setUserActive(user.id, false).subscribe({
      next: () => {
        user.status = 'Suspended';
        user.isSuspended = true;
        user.isActive = false;
        this.pendingIds.delete(user.id);
        this.applyFilter();

        void Swal.fire({
          title: 'Suspended'
          ,text: `User "${this.displayName(user)}" has been suspended.`
          ,icon: 'success'
          ,timer: 1600
          ,showConfirmButton: false
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to suspend user.';
        this.pendingIds.delete(user.id);
      },
    });
  }

  private applyFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredUsers = [...this.users];
      return;
    }

    this.filteredUsers = this.users.filter((u) => {
      const username = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return username.includes(query) || email.includes(query);
    });
  }
}
