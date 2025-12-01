import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type Project = {
  title: string;
  date: string;
  image: string;
  shortDescription: string;
  longDescription: string;
  tags?: string[];
};

type Experience = {
  title: string;
  shortDescription: string;
  longDescription: string;
  image?: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly datePipe = inject(DatePipe);

  protected readonly projects = signal<Project[]>([]);
  protected readonly isLoadingProjects = signal(true);
  protected readonly errorLoadingProjects = signal(false);
  protected readonly experiences = signal<Experience[]>([]);
  protected readonly isLoadingExperiences = signal(true);
  protected readonly errorLoadingExperiences = signal(false);
  protected readonly aboutParagraphs = [
    'Développeur full-stack passionné, je crée des expériences web rapides, accessibles et centrées sur l’utilisateur.',
    'J’adore transformer des idées complexes en interfaces élégantes et fluides, tout en gardant une base de code maintenable.',
    'Toujours curieux, je suis en veille constante sur les meilleures pratiques front-end et cloud pour booster les produits que je construis.'
  ];
  protected readonly expertise = [
    'Applications web scalables',
    'Design systems Tailwind',
    'Intégrations API & CI/CD'
  ];
  protected readonly navLinks = [
    { label: 'Projets', href: '#projects' },
    { label: 'Expériences', href: '#experiences' },
    { label: 'À propos', href: '#about' },
    { label: 'Contact', href: '#contact' }
  ];
  protected readonly socialLinks = [
    { label: 'GitHub', url: 'https://github.com/', icon: 'github' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/', icon: 'linkedin' },
    { label: 'X', url: 'https://twitter.com/', icon: 'twitter' }
  ];
  protected readonly currentYear = new Date().getFullYear();

  protected readonly contactForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });
  protected readonly contactStatus = signal('');

  constructor() {
    this.loadProjects();
    this.loadExperiences();
  }

  protected submitContact(): void {
    this.contactStatus.set('');
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const { name } = this.contactForm.getRawValue();
    this.contactStatus.set(`Merci ${name}, je reviens vers vous rapidement !`);
    this.contactForm.reset({ name: '', email: '', message: '' });
  }

  private loadProjects(): void {
    this.isLoadingProjects.set(true);
    this.http.get<Project[]>('data/projects.json').subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.errorLoadingProjects.set(false);
        this.isLoadingProjects.set(false);
      },
      error: () => {
        this.errorLoadingProjects.set(true);
        this.isLoadingProjects.set(false);
      }
    });
  }

  private loadExperiences(): void {
    this.isLoadingExperiences.set(true);
    this.http.get<Experience[]>('data/experiences.json').subscribe({
      next: (experiences) => {
        this.experiences.set(experiences);
        this.errorLoadingExperiences.set(false);
        this.isLoadingExperiences.set(false);
      },
      error: () => {
        this.errorLoadingExperiences.set(true);
        this.isLoadingExperiences.set(false);
      }
    });
  }

  protected formatProjectDate(rawDate: string): string {
    const parsedDate = new Date(rawDate);
    if (!Number.isNaN(parsedDate.getTime())) {
      const formatted = this.datePipe.transform(parsedDate, 'd MMMM yyyy', undefined, 'fr');
      if (formatted) {
        return formatted;
      }
    }
    return rawDate;
  }
}
