export interface ProfileSlide {
  id: string;
  imageUrl: string;
  altText: string;
  sectionLabel: string;
  heading: string;
  description: string;
  pdfPage: number;
  aspectWidth: number;
  aspectHeight: number;
}

export interface ProfileSlideshowDataset {
  id: string;
  sectionAnchor: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  slides: ProfileSlide[];
}

export const INTRO_SLIDESHOW: ProfileSlideshowDataset = {
  id: 'organizational-introduction',
  sectionAnchor: 'about',
  eyebrow: '01 · Organizational Introduction',
  title: 'Building Skills, Technology & Innovators for Bangladesh',
  subtitle:
    'Hands-on engineering led by practitioners advancing indigenous hardware, drones, robotics, AI, and applied technical training.',
  slides: [
    {
      id: 'intro-cover-workbench',
      imageUrl: '/assets/profile/intro/marvz-team-drone-prototyping-intro.jpg',
      altText:
        'Three MARVZ & INNOVATION TECH engineers collaborating at a workbench wiring and assembling a custom carbon-fiber multi-rotor drone',
      sectionLabel: 'Organizational Introduction',
      heading: 'Engineering & Hardware Collaboration at MARVZ',
      description:
        'Engineers wiring flight controllers, power distribution electronics, and custom multi-rotor airframes at our collaborative prototyping bench.',
      pdfPage: 1,
      aspectWidth: 1089,
      aspectHeight: 842,
    },
  ],
};

export const DRONE_TECHNOLOGY_SLIDESHOW: ProfileSlideshowDataset = {
  id: 'drone-technology',
  sectionAnchor: 'drone-technology-showcase',
  eyebrow: '02 · Drone Technology Showcase',
  title: 'Building Bangladesh’s Indigenous Drone Movement',
  subtitle:
    'Designing, assembling, calibrating, and demonstrating custom multi-rotor and fixed-wing UAV platforms alongside practical avionics training.',
  slides: [
    {
      id: 'drone-propulsion-lecture',
      imageUrl: '/assets/profile/drone-technology/drone-propulsion-lecture-demo.jpg',
      altText:
        'MARVZ instructor demonstrating quadcopter propulsion and brushless versus brushed motor architecture with a multi-rotor UAV frame',
      sectionLabel: 'Drone Technology',
      heading: 'Propulsion & Multi-Rotor Architecture Briefing',
      description:
        'Technical session comparing quadcopter motor topologies, ESC integration, and structural assembly using live MARVZ UAV hardware.',
      pdfPage: 4,
      aspectWidth: 1030,
      aspectHeight: 686,
    },
    {
      id: 'drone-airframe-design',
      imageUrl: '/assets/profile/drone-technology/drone-airframe-design-briefing.jpg',
      altText:
        'Engineers and learners inspecting a custom multi-rotor UAV frame, landing skids, and onboard avionics wiring',
      sectionLabel: 'Drone Technology',
      heading: 'Airframe Design & Avionics Inspection',
      description:
        'Interactive engineering walkthrough examining landing gear geometry, propulsion placement, and telemetry link configuration.',
      pdfPage: 4,
      aspectWidth: 1044,
      aspectHeight: 579,
    },
    {
      id: 'drone-field-exhibition',
      imageUrl: '/assets/profile/drone-technology/drone-outdoor-field-exhibition.jpg',
      altText:
        'Outdoor MARVZ field exhibition presenting a custom multi-rotor drone and flight radio controller to attendees',
      sectionLabel: 'Drone Technology',
      heading: 'Field Exhibition & Radio Telemetry Demonstration',
      description:
        'Public technical demonstration presenting indigenous multi-rotor UAV builds, radio control transmitters, and mission readiness.',
      pdfPage: 5,
      aspectWidth: 955,
      aspectHeight: 640,
    },
    {
      id: 'drone-rd-workstation',
      imageUrl: '/assets/profile/drone-technology/drone-rd-lab-workstation.jpg',
      altText:
        'MARVZ Drone R&D workstation showing custom fixed-wing and multi-rotor aircraft alongside flight controllers and technical recognitions',
      sectionLabel: 'Drone Technology',
      heading: 'Drone R&D Workstation & Fleet Prototypes',
      description:
        'Dedicated MARVZ aerospace bench housing custom multi-rotor UAVs, fixed-wing test airframes, flight radios, and calibration tooling.',
      pdfPage: 5,
      aspectWidth: 604,
      aspectHeight: 454,
    },
  ],
};

export const ROBOTICS_INNOVATION_SLIDESHOW: ProfileSlideshowDataset = {
  id: 'robotics-science-innovation',
  sectionAnchor: 'robotics-science-innovation',
  eyebrow: '03 · Robotics & Science Innovation',
  title: 'From Humanoid Robots to Custom Engineering Projects',
  subtitle:
    'Indigenous humanoid prototypes, programmable robotic systems, embedded electronics labs, and custom science engineering builds.',
  slides: [
    {
      id: 'robotics-humanoid-showcase',
      imageUrl: '/assets/profile/robotics-innovation/humanoid-robot-media-showcase.jpg',
      altText:
        'MARVZ leadership presenting an indigenous humanoid robot prototype during a television and public technology showcase',
      sectionLabel: 'Robotics & Science Innovation',
      heading: 'Indigenous Humanoid Robot Public Showcase',
      description:
        'Presenting a locally engineered humanoid robotics prototype and its embedded control systems during media coverage and public demonstration.',
      pdfPage: 6,
      aspectWidth: 587,
      aspectHeight: 364,
    },
    {
      id: 'robotics-humanoid-recognition',
      imageUrl: '/assets/profile/robotics-innovation/humanoid-robot-award-recognition.jpg',
      altText:
        'MARVZ humanoid robot prototype displayed alongside formal recognition trophy and certification folder',
      sectionLabel: 'Robotics & Science Innovation',
      heading: 'Robotic Prototype & Competition Recognition',
      description:
        'Custom articulated humanoid system showcased with recognition honors awarded for indigenous robotics engineering.',
      pdfPage: 6,
      aspectWidth: 343,
      aspectHeight: 364,
    },
    {
      id: 'robotics-cad-classroom',
      imageUrl: '/assets/profile/robotics-innovation/robotics-cad-classroom-session.jpg',
      altText:
        'Instructor guiding learners through Bluetooth-controlled robotic vehicle assembly and embedded code in a classroom lab',
      sectionLabel: 'Robotics & Science Innovation',
      heading: 'Mobile Robotics & Embedded Firmware Lab',
      description:
        'Guided classroom session connecting wireless microcontroller schematics, chassis assembly, and real-time robot actuation.',
      pdfPage: 6,
      aspectWidth: 427,
      aspectHeight: 312,
    },
    {
      id: 'robotics-electronics-training',
      imageUrl: '/assets/profile/robotics-innovation/robotics-electronics-diagram-training.jpg',
      altText:
        'Instructor teaching circuit diagrams, microcontrollers, sensors, and actuator fundamentals on an interactive display',
      sectionLabel: 'Robotics & Science Innovation',
      heading: 'Sensors, Microcontrollers & Circuit Architecture',
      description:
        'Practical classroom instruction covering sensor interfacing, motor driver blocks, and microcontroller system integration.',
      pdfPage: 6,
      aspectWidth: 320,
      aspectHeight: 312,
    },
  ],
};

export const EMPOWERING_CREATORS_SLIDESHOW: ProfileSlideshowDataset = {
  id: 'empowering-future-creators',
  sectionAnchor: 'empowering-creators',
  eyebrow: '04 · Empowering Future Creators',
  title: 'Cultivating Bangladesh’s Next Generation of Builders',
  subtitle:
    'Hands-on mentorship for students, educators, and technology enthusiasts building physical robotics, circuits, and custom science projects.',
  slides: [
    {
      id: 'creators-science-exhibition',
      imageUrl: '/assets/profile/empowering-creators/students-science-exhibition-showcase.jpg',
      altText:
        'MARVZ mentor reviewing custom structural and electronics science exhibition projects built by student teams',
      sectionLabel: 'Empowering Future Creators',
      heading: 'Student Science & Engineering Exhibition Review',
      description:
        'Engaging directly with student builders presenting integrated mechanical and electronic exhibition models.',
      pdfPage: 7,
      aspectWidth: 487,
      aspectHeight: 333,
    },
    {
      id: 'creators-prototyping-mentorship',
      imageUrl: '/assets/profile/empowering-creators/students-circuit-prototyping-mentorship.jpg',
      altText:
        'Small-group engineering mentorship reviewing system sketches and digital electronics designs with students',
      sectionLabel: 'Empowering Future Creators',
      heading: 'One-on-One Circuit & System Design Mentorship',
      description:
        'Collaborative table session guiding students from initial schematic sketches to testable hardware prototypes.',
      pdfPage: 7,
      aspectWidth: 464,
      aspectHeight: 333,
    },
    {
      id: 'creators-robotic-arm-lab',
      imageUrl: '/assets/profile/empowering-creators/students-robotic-arm-assembly.jpg',
      altText:
        'Learners assembling a mechanical robotic hand manipulator and multi-wheel robot platform in the lab',
      sectionLabel: 'Empowering Future Creators',
      heading: 'Articulated Robotic Hand & Chassis Assembly',
      description:
        'Hands-on lab work building servo-actuated robotic manipulators and programmable mobile robot kits.',
      pdfPage: 7,
      aspectWidth: 377,
      aspectHeight: 333,
    },
    {
      id: 'creators-electronics-workshop',
      imageUrl: '/assets/profile/empowering-creators/young-creators-electronics-workshop.jpg',
      altText:
        'Young learners participating in a guided electronics and hardware prototyping session at MARVZ',
      sectionLabel: 'Empowering Future Creators',
      heading: 'Foundational Electronics & STEM Maker Workshop',
      description:
        'Introducing younger creators to breadboards, switches, power circuitry, and collaborative hardware problem-solving.',
      pdfPage: 7,
      aspectWidth: 456,
      aspectHeight: 333,
    },
  ],
};

export const RECOGNITION_PARTNERSHIPS_SLIDESHOW: ProfileSlideshowDataset = {
  id: 'recognition-and-partnerships',
  sectionAnchor: 'recognition-partnerships',
  eyebrow: '05 · Recognition & Partnerships',
  title: 'Institutional Exchanges & Technical Delegations',
  subtitle:
    'Collaborative technology exchanges, engineering reviews, and hardware demonstrations with institutional leadership and international delegations.',
  slides: [
    {
      id: 'recognition-institutional-exchange',
      imageUrl: '/assets/profile/recognition-partnerships/military-institutional-collaboration.jpg',
      altText:
        'MARVZ engineering leadership exchanging formal institutional recognition with military officials',
      sectionLabel: 'Recognition & Partnerships',
      heading: 'Institutional Technology & Defense Collaboration',
      description:
        'Formal recognition exchange reflecting institutional engagement on applied technology initiatives and capability building.',
      pdfPage: 8,
      aspectWidth: 374,
      aspectHeight: 354,
    },
    {
      id: 'recognition-delegation-inspecting-hardware',
      imageUrl: '/assets/profile/recognition-partnerships/international-delegation-tech-exchange-1.jpg',
      altText:
        'International guests and academic representatives inspecting a custom MARVZ hardware prototype',
      sectionLabel: 'Recognition & Partnerships',
      heading: 'International Delegation Hardware Inspection',
      description:
        'Visiting international delegates examining custom-engineered MARVZ robotics and embedded control prototypes alongside academic partners.',
      pdfPage: 8,
      aspectWidth: 464,
      aspectHeight: 312,
    },
    {
      id: 'recognition-delegation-flight-systems',
      imageUrl: '/assets/profile/recognition-partnerships/international-delegation-tech-exchange-2.jpg',
      altText:
        'MARVZ leadership demonstrating telemetry controller hardware to an international delegation',
      sectionLabel: 'Recognition & Partnerships',
      heading: 'Cross-Border Engineering & Telemetry Briefing',
      description:
        'Technical exchange with visiting international guests exploring MARVZ drone control units and applied R&D platforms.',
      pdfPage: 8,
      aspectWidth: 576,
      aspectHeight: 393,
    },
  ],
};

export const ALL_PROFILE_GALLERY_PHOTOS: ProfileSlide[] = [
  ...INTRO_SLIDESHOW.slides,
  ...DRONE_TECHNOLOGY_SLIDESHOW.slides,
  ...ROBOTICS_INNOVATION_SLIDESHOW.slides,
  ...EMPOWERING_CREATORS_SLIDESHOW.slides,
  ...RECOGNITION_PARTNERSHIPS_SLIDESHOW.slides,
];

