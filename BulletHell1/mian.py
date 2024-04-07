# main.py

import pygame
import sys
import random
from player import Player
from enemy import Enemy
from bullet import Bullet  # Importing the Bullet class from bullet.py
from config import SCREEN_WIDTH, SCREEN_HEIGHT

# Initialize Pygame
pygame.init()

# Set up the screen
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Bullet Hell Game")

# Create player
player = Player()

# Create a list to hold enemy instances
enemies = []

# Create enemies
def create_enemy():
    enemy = Enemy()
    enemies.append(enemy)

# Create a list to hold bullet instances
bullets = []

# Function to create bullets
def create_bullet(x, y):
    bullet = Bullet(x, y)
    bullets.append(bullet)

# Timer for enemy and bullet creation
enemy_timer = 0
enemy_creation_interval = 2100   # Create a new enemy every 60 frames
bullet_timer = 0
bullet_creation_interval = 1000  # Create a new bullet every 10 frames

# Game loop
running = True
while running:
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    # Update
    player.update()

    # Create enemies
    enemy_timer += 1
    if enemy_timer >= enemy_creation_interval:
        create_enemy()
        enemy_timer = 0

    # Update enemies
    for enemy in enemies:
        enemy.update()

    # Create bullets
    keys = pygame.key.get_pressed()
    if keys[pygame.K_SPACE]:
        if bullet_timer >= bullet_creation_interval:
            create_bullet(player.x + player.size // 2, player.y)
            bullet_timer = 0

    # Update bullets
    for bullet in bullets:
        bullet.update()

    # Draw
    screen.fill((0, 0, 0))
    player.draw(screen)
    for enemy in enemies:
        enemy.draw(screen)
    for bullet in bullets:
        bullet.draw(screen)
    pygame.display.flip()

    # Bullet-enemy collision detection
    for bullet in bullets:
        for enemy in enemies:
            if bullet.collide_with_enemy(enemy):
                enemies.remove(enemy)
                bullets.remove(bullet)
                break

    # Bullet-player collision detection
    for bullet in bullets:
        if bullet.collide_with_player(player):
            # Handle player being hit by bullet
            pass

    # Increment bullet timer
    bullet_timer += 1

# Quit Pygame
pygame.quit()
sys.exit()
