import {
  LucideIconNode,
  Plus,
  CalendarClock,
  Annoyed,
  Swords,
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
    ];
  }

  static getIconByName(name: string) {
    return this.getIcons().find((icon) => icon.name === name)?.icon;
  }
}
