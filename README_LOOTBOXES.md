# Task Loot Boxes Feature

This document provides information about the Task Loot Boxes feature and how to set it up in your application.

## Overview

Task Loot Boxes is a gamification feature that rewards users with keys when they complete tasks. These keys can be used to open virtual loot boxes containing various rewards like themes, badges, and special features.

## Features

- Earn keys by completing tasks
- Spend keys to open loot boxes of different rarities
- Collect and activate rewards (themes, badges, animations, features)
- Apply themes to change the UI appearance

## Setup Instructions

### 1. Run the Database Seeding Script

Before using the feature, you need to populate your database with initial rewards and loot boxes:

```bash
cd backend
node scripts/seedRewards.js
```

This script will:

- Create sample rewards of different types and rarities
- Create three loot box types (Basic, Premium, and Legendary)
- Configure probability distributions for each loot box

### 2. Initialize a User (Optional)

To quickly test the feature with an existing user, you can use the initialization script:

```bash
cd backend
node scripts/initializeUser.js
```

The script will:

- Prompt for a user's email address
- Add keys to that user
- Add a default theme if none is active

### 3. Test the Feature

1. Complete tasks to earn keys
2. Visit the "Loot Boxes" page to open boxes with your keys
3. Go to the "Rewards" page to view and activate your collected rewards
4. Theme rewards will automatically apply when activated

## Reward Types

The system supports the following reward types:

### Themes

Themes change the color scheme of the application. Each theme includes:

- Background color
- Text colors (primary and secondary)
- Accent color
- Border color

### Badges

Badges are visual indicators that show achievements. They include:

- Icon type
- Color

### Animations

Animations change how elements appear on the page:

- Animation type
- Duration
- Timing function

### Features

Features unlock additional functionality:

- Feature identifier
- Enabled status

## Loot Box Types

### Basic Loot Box (1 key)

- 70% chance for common rewards
- 30% chance for uncommon rewards

### Premium Loot Box (3 keys)

- 25% chance for common rewards
- 40% chance for uncommon rewards
- 30% chance for rare rewards
- 5% chance for epic rewards

### Legendary Loot Box (5 keys)

- 10% chance for uncommon rewards
- 30% chance for rare rewards
- 45% chance for epic rewards
- 15% chance for legendary rewards

## Implementation Details

### Backend Models

- `Key`: Tracks the number of keys each user has earned
- `Reward`: Defines different types of rewards (themes, badges, etc.)
- `LootBox`: Defines different loot box types and their reward probabilities
- `UserReward`: Tracks which rewards a user has unlocked and which are active

### Key Acquisition

Keys are awarded when:

- A task is marked as completed

### Reward Activation

- Theme rewards are automatically applied when activated
- Badge and animation rewards can be activated but require additional frontend implementation
- Feature rewards unlock new functionality but require specific implementation for each feature

## Extending the System

To add new reward types:

1. Update the `Reward` model schema if needed
2. Add the new rewards to the seeding script
3. Implement the frontend UI for displaying and activating the new rewards
4. Add handlers for applying the reward effects

## Styling

All UI components follow the core minimalistic matte black aesthetic with:

- Ultra-thin typefaces
- Low contrast elements
- Subtle hover effects
- Compact layouts
