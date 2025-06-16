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
  rsSchoolWebsiteUrl = 'https://rs.school/';

  teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Giorgi Jajanidze',
      role: 'Frontend Developer & Team Lead',
      bio: '21 years old student,currently studying in TSU, Georgia on faculty Computer Science. have experience with backend languages ,now working 0n front-end side for 1.5 years.',
      photoUrl: './assets/pfp.jpg',
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
      bio: 'Graduated from BSU with a degree in mathematics and computer science.Constantly improves skills through RSSchool courses and practical projects. Analytical mind and attention to detail.Ability to work in a team.',
      photoUrl: './assets/pasha.jpg',
      githubUrl: 'https://github.com/pashaby94',
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
      bio: 'Almost all life had jobs related to computers, so finally started education path in programming almost two years ago. Open minded. Has motivation and desire for learning.',
      photoUrl: './assets/denis.png',
      githubUrl: 'https://github.com/deniskarev',
      contributions: [
        'Developed tests',
        'Set up Angular routing and project management',
        'Implemented detailed product page',
        'configuration of the scripts',
        'Comprehensive README documentation',
        'Identified and resolved critical bugs',
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
