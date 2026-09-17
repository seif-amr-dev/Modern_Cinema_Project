import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { UserService } from '../../core/services/user';
import { IUser } from '../../models/iuser';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  user = signal<IUser | null>(null);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  isEditing = signal<boolean>(false);

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    dateOfBirth: [''],
    gender: ['']
  });

  selectedImage: File | null = null;

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const response: any = await this.authService.getMe();
      const userData = response.data || response.result || response;
      this.user.set(userData);
      this.populateForm(userData);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      this.errorMessage.set(err.error?.message || 'Could not load profile data.');
    } finally {
      this.isLoading.set(false);
    }
  }

  populateForm(userData: IUser) {
    let dob = '';
    if (userData.dateOfBirth) {
      const date = new Date(userData.dateOfBirth);
      if (!isNaN(date.getTime())) {
        dob = date.toISOString().split('T')[0];
      }
    }

    this.profileForm.patchValue({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      dateOfBirth: dob,
      gender: userData.gender || ''
    });
  }

  toggleEdit() {
    this.isEditing.update(val => !val);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    if (!this.isEditing() && this.user()) {
      this.populateForm(this.user()!);
      this.selectedImage = null; 
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
    }
  }

  async onSave() {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const currentUser = this.user();
      if (!currentUser || !currentUser._id) throw new Error("User ID not found");
      const formValue = this.profileForm.value;
      const updateData: Partial<IUser> = {
        name: formValue.name || undefined,
        email: formValue.email || undefined,
        phone: formValue.phone || undefined,
        dateOfBirth: formValue.dateOfBirth || undefined,
        gender: (formValue.gender as 'male' | 'female') || undefined
      };
      
      const response: any = await this.userService.updateProfile(currentUser._id, updateData);
      if (this.selectedImage) {
        this.isUploading.set(true);
        const imageRes: any = await this.userService.updateProfileImage(currentUser._id, this.selectedImage);
        this.user.set(imageRes.result || imageRes.data);
      } else {
        this.user.set(response.result || response.data);
      }
      
      this.successMessage.set('Profile updated successfully!');
      this.isEditing.set(false);
      this.selectedImage = null;
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      this.errorMessage.set(err.error?.message || 'Could not update profile.');
    } finally {
      this.isSaving.set(false);
      this.isUploading.set(false);
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}