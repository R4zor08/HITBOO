# HITBOO Game Manual

## Getting Started

HITBOO is a turn-based arcade artillery combat game where you aim and fire projectiles at your opponent. The enhanced UI provides clear visual feedback for all gameplay elements.

## Game Interface

### Top Corners: Player Status Panels
**Left Panel (Your Info)**
- Your name and level
- Health bar with current HP
- Character avatar
- "Your Turn" indicator when active

**Right Panel (Enemy Info)**
- Opponent name and level
- Health bar with current HP  
- Character avatar
- Turn indicator when it's their turn

### Center Top: AIM LINK Instructions
Shows on first turn explaining the controls:
- Press/drag your sticker to aim
- Pull back to charge power
- Release to fire
- Keyboard: Arrows/WASD to adjust, Space to shoot

### Left Side: Charge Meter (During Your Turn)
- **CHARGE %**: Current shot power (0-100%)
- **ANG**: Aiming angle (0-90 degrees)
- **Status**: Shows "CHARGING..." when holding aim or "READY" when idle
- Color changes to magenta when actively charging

### Center: Battle Arena
The main game area showing:
- Both character stickers
- Projectiles in flight
- Trajectory preview (cyan dashed line)
- Landing point indicator (cyan crosshair)
- Wind direction and magnitude

### Bottom: Weapon Loadout Panel (During Your Turn)
Display of 4 available weapons with:
- Weapon icon and name
- Selected weapon glows magenta
- Damage number in top-right corner
- Click to switch weapons before firing

### Center Bottom: Wind Indicator
Shows current wind conditions:
- Arrow pointing wind direction
- 5 bars showing wind magnitude
- Numeric speed display
- Alert if wind is strong

## How to Play

### 1. Aiming Your Shot

**Using Mouse/Touch:**
1. Press and hold on your character at the bottom
2. Drag backward/downward to pull back (charge power)
3. Angle follows your drag direction
4. Release to fire when ready

**Using Keyboard:**
- **Arrow Up / W**: Increase power
- **Arrow Down / S**: Decrease power
- **Arrow Right / D**: Aim up (higher angle)
- **Arrow Left / A**: Aim down (lower angle)
- **Space or Enter**: Fire when power ≥ 5%

### 2. Reading the Trajectory Preview
Once you've charged enough (power > 2%):
- **Cyan dashed line**: Path your projectile will take
- **Cyan crosshair**: Where projectile will land
- **Dashed magenta line**: Shows your aim direction
- Wind arrows show how wind will affect trajectory

### 3. Firing Your Shot
- Mouse: Release the drag to fire
- Keyboard: Press Space or Enter
- Minimum power required: 5% (prevents accidental shots)

### 4. Understanding Damage

**Damage = Base Weapon Damage × Power Multiplier**

- Low power (5-30%): 25-60% weapon damage
- Medium power (30-70%): 60-95% weapon damage
- High power (70-100%): 95-120% weapon damage
- Critical hit (power > 80%): Extra visual effect + bonus damage

### 5. Wind Effects

Wind modifies your trajectory:
- Green wind bar = no wind or very weak
- Yellow wind bar = moderate wind (slight deviation)
- Red wind bar = strong wind (significant deviation)

**How to Compensate:**
- Wind from right: Aim slightly left
- Wind from left: Aim slightly right
- Stronger wind = larger adjustment needed

## Weapons

Each weapon has different properties:

- **Power**: Affects projectile speed and range
- **Accuracy**: How stable the shot is
- **Damage**: Base damage dealt on hit
- **Type**: Determines projectile appearance and behavior

Select the best weapon for your strategy before firing.

## Winning

- First player to reduce opponent's HP to 0 wins
- Match statistics are tracked:
  - Total shots fired
  - Shots that hit
  - Total damage dealt
  - Accuracy percentage
  - Number of turns

## Tips & Tricks

1. **Learn Wind Compensation**: Practice adjusting for wind effects
2. **Use Trajectory Preview**: Always aim above opponent slightly (projectiles arc)
3. **Power Management**: Don't always max power; precision often beats power
4. **Watch Enemy Patterns**: Some AI opponents have predictable tactics
5. **Weapon Switching**: Change weapons based on wind conditions
6. **Angle Variation**: Try different angles to find sweet spots

## Accessibility Features

- **Reduce Motion**: Disables animations if preferred
- **Keyboard Controls**: Full game playable without mouse
- **High Contrast**: Neon colors maintain visibility
- **Screen Reader Support**: Game designed with semantic HTML
- **Touch Support**: Full touch and pointer event handling

## Troubleshooting

### Shot Not Hitting
- Check if wind is pushing projectile away
- Make sure power is high enough
- Aim slightly above target (projectile drops due to gravity)
- Watch the trajectory preview for guidance

### Can't Aim
- Make sure it's your turn (check if "Your Turn" shows)
- Ensure instructions panel is dismissed
- Try different aiming method (mouse vs keyboard)
- Check browser zoom level isn't interfering

### Game Seems Unresponsive
- Wait for previous projectile to finish animating
- Ensure charge power is above 5% before firing
- Try refreshing the page if UI seems stuck

### Mobile Controls Not Working
- Use pointer events (tap and drag) instead of mouse
- Try keyboard controls if available
- Ensure browser permissions allow access

## Game Modes

**Standard**: Battle against AI opponent with difficulty scaling

**Practice**: Fight a stationary dummy target for learning

**Local 2P**: Two players on same device (take turns at the controller)

## Settings

Access game settings via the gear icon:
- Master Volume
- SFX Volume  
- Default Aim Sensitivity
- Difficulty (Casual/Normal/Hard)
- Reduce Motion toggle
- Player name and accent color

## Keyboard Shortcuts

- **Arrows/WASD**: Adjust aim angle/power
- **Space/Enter**: Fire shot
- **Settings icon**: Open game settings
- **Exit**: Return to main menu

Enjoy playing HITBOO!
