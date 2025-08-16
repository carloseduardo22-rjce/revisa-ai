import {
  LucideIconNode,
  Plus,
  CalendarClock,
  Annoyed,
  Swords,
  MicVocal,
  Square,
  HardDriveDownload,
} from 'lucide-angular';

export interface IconData {
  icon: Readonly<LucideIconNode[]>;
  name: string;
  description?: string;
  action?: string;
}

export default class LucideIconData {
  static getIcons(): IconData[] {
    return [
      {
        icon: Plus,
        name: 'plus',
      },
      {
        icon: CalendarClock,
        name: 'calendarClock',
      },
      {
        icon: Annoyed,
        name: 'annoyed',
      },
      {
        icon: Swords,
        name: 'swords',
      },
      {
        icon: MicVocal,
        name: 'micVocal',
      },
      {
        icon: Square,
        name: 'square',
      },
      {
        icon: HardDriveDownload,
        name: 'hardDrive',
      },
    ];
  }

  static getIconByName(name: string) {
    return this.getIcons().find((icon) => icon.name === name)?.icon;
  }
}
