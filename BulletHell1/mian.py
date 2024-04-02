# main.py

import pygame
import sys
import random
from player import Player
from enemy import Enemy  # Importing the Enemy class from enemy.py
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

# Timer for enemy creation
enemy_timer = 0
enemy_creation_interval = 60  # Create a new enemy every 60 frames

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

    # Draw
    screen.fill((0, 0, 0))
    player.draw(screen)
    for enemy in enemies:
        enemy.draw(screen)
    pygame.display.flip()

# Quit Pygame
pygame.quit()
sys.exit()
