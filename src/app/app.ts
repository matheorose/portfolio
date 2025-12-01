import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScrollRevealDirective } from './directives/scroll-reveal.directive';

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
  imports: [CommonModule, ReactiveFormsModule, ScrollRevealDirective],
  providers: [DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly datePipe = inject(DatePipe);

  protected readonly projects = signal<Project[]>([]);
  protected readonly isLoadingProjects = signal(true);
  protected readonly errorLoadingProjects = signal(false);
  protected readonly experiences = signal<Experience[]>([]);
  protected readonly isLoadingExperiences = signal(true);
  protected readonly errorLoadingExperiences = signal(false);
  protected readonly heroFullText = "Bonjour, je m'appelle Mathéo Rose. Bienvenue dans mon portfolio";
  protected readonly typedHeroText = signal('');
  protected readonly aboutParagraphs = [
    'Je m’appelle Mathéo, développeur passionné par la création d’expériences digitales modernes et utiles.',
    'J’accorde une attention particulière au détail, à la fluidité et à la qualité technique : j’aime que chaque projet soit propre, cohérent et agréable à utiliser.',
    'Je suis curieux, motivé et toujours prêt à explorer de nouvelles idées ou technologies.',
    'Au fil des projets, j’ai développé une approche simple : comprendre, concevoir, améliorer… et continuer d’apprendre.',
    'Ma curiosité et mon intérêt pour les nouvelles technologies me poussent constamment à veiller et à expérimenter afin de rester à la pointe des tendances de la programmation.'
  ];
  protected readonly navLinks = [
    { label: 'À propos', href: '#about' },
    { label: 'Projets', href: '#projects' },
    { label: 'Expériences', href: '#experiences' },
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

  private typingIntervalId?: ReturnType<typeof setInterval>;

  constructor() {
    this.loadProjects();
    this.loadExperiences();
    this.startHeroTyping();
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

  ngOnDestroy(): void {
    this.clearTypingInterval();
  }

  private startHeroTyping(): void {
    this.clearTypingInterval();
    const text = this.heroFullText;
    let index = 0;
    this.typedHeroText.set('');

    this.typingIntervalId = setInterval(() => {
      index += 1;
      this.typedHeroText.set(text.slice(0, index));

      if (index >= text.length) {
        this.clearTypingInterval();
      }
    }, 50);
  }

  private clearTypingInterval(): void {
    if (this.typingIntervalId !== undefined) {
      clearInterval(this.typingIntervalId);
      this.typingIntervalId = undefined;
    }
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
