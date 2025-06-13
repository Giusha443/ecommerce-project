// about-us.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  githubUrl: string;
  contributions: string[];
}

@Component({
  selector: 'app-about-us',
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
})
export class AboutUsComponent {
  rsSchoolLogoUrl = 'https://rs.school/images/rs_school_js.svg';
  rsSchoolWebsiteUrl = 'https://rs.school/';

  teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Giorgi Jajanidze',
      role: 'Frontend Developer & Team Lead',
      bio: '22 years old student, have experience with backend languages ,now working in front-end side for 1.5 years.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      githubUrl: 'https://github.com/giusha443',
      contributions: [
        'Developed the product catalog and search functionality',
        'Implemented responsive design',
        'Implemented user authentication and authorization',
        'Implemented login page',
        'Implemented About us page',
        'Led code reviews and established coding standards',
      ],
    },
    {
      id: 2,
      name: 'Pavel Svenin',
      role: 'Frontend Developer',
      bio: 'Full-stack developer with expertise in backend technologies and cloud infrastructure. Passionate about scalable architecture, API design, and automated deployment processes.',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      githubUrl: 'https://github.com/mikejohnson',
      contributions: [
        'Developed integration with CommerceTools and backend services',
        'Implemented registration page',
        'Implemented strict linter rules',
        'Implemented User profile page',
        'implemented Basket page',
        'Fixed buts after code reviews',
      ],
    },
    {
      id: 3,
      name: 'Denis Karev',
      role: 'Frontedn developer',
      bio: 'Detail-oriented QA engineer with expertise in automated testing, quality assurance, and ensuring robust application performance across different platforms and devices.',
      photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      githubUrl: 'https://github.com/deniskarev',
      contributions: [
        'Developed comprehensive testing strategies and test cases',
        'Set up Angular routing and project management',
        'Implemented detailed product page',
        'configuration of the scripts for the project',
        'Comprehensive README documentation',
        'Identified and resolved critical bugs and performance issues',
      ],
    },
  ];

  collaborationDescription = `
    Our team successfully delivered this e-commerce platform through effective collaboration, 
    utilizing modern development practices and maintaining constant communication. We employed 
    agile methodologies, conducted regular code reviews, and leveraged version control with Git 
    for seamless integration. Each team member brought unique expertise, from frontend development 
    and UI/UX design to backend architecture and testing. Our collaborative approach included 
    daily standups, sprint planning, and continuous integration, ensuring high code quality 
    and timely delivery of features.
  `;

  constructor() {}

  onRsSchoolLogoClick(): void {
    window.open(this.rsSchoolWebsiteUrl, '_blank');
  }

  onGithubLinkClick(githubUrl: string): void {
    window.open(githubUrl, '_blank');
  }

  trackByMemberId(index: number, member: TeamMember): number {
    return member.id;
  }
}
