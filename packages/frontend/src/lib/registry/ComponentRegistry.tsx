import React from 'react';
import type { ComponentRegistry as IComponentRegistry } from '@a2ui/shared/react';
import type { ComponentType } from '@a2ui/shared/react';
import Text from '../../components/a2ui/Text';
import Button from '../../components/a2ui/Button';
import Card from '../../components/a2ui/Card';
import Row from '../../components/a2ui/Row';
import Column from '../../components/a2ui/Column';
import List from '../../components/a2ui/List';
import TextField from '../../components/a2ui/TextField';
import Image from '../../components/a2ui/Image';
import Link from '../../components/a2ui/Link';
import Select from '../../components/a2ui/Select';
import TextArea from '../../components/a2ui/TextArea';
import Checkbox from '../../components/a2ui/Checkbox';
import Badge from '../../components/a2ui/Badge';
import Divider from '../../components/a2ui/Divider';

class ComponentRegistry implements IComponentRegistry {
  private components = new Map<string, ComponentType>();

  constructor() {
    // Register standard components
    this.register('Text', Text);
    this.register('Button', Button);
    this.register('Card', Card);
    this.register('Row', Row);
    this.register('Column', Column);
    this.register('List', List);
    this.register('TextField', TextField);
    this.register('Image', Image);
    this.register('Link', Link);
    this.register('Select', Select);
    this.register('TextArea', TextArea);
    this.register('Checkbox', Checkbox);
    this.register('Badge', Badge);
    this.register('Divider', Divider);
  }

  register(type: string, component: ComponentType): void {
    this.components.set(type, component);
  }

  get(type: string): ComponentType | undefined {
    return this.components.get(type);
  }

  has(type: string): boolean {
    return this.components.has(type);
  }
}

export default new ComponentRegistry();
