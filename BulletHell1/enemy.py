import pygame
import random
from config import ENEMY_SIZE, ENEMY_COLOR, SCREEN_WIDTH, SCREEN_HEIGHT

class Enemy:
    def __init__(self):
        # Initialize enemy position
        self.x = random.randint(0, SCREEN_WIDTH - ENEMY_SIZE)
        self.y = -ENEMY_SIZE
        self.speed = 3

    def update(self):
        # Update enemy position (movement pattern)
        self.y += self.speed

        # Reset enemy position if it goes off the screen
        if self.y > SCREEN_HEIGHT:
            self.reset()

    def draw(self, screen):
        # Draw enemy on the screen
        pygame.draw.rect(screen, ENEMY_COLOR, (self.x, self.y, ENEMY_SIZE, ENEMY_SIZE))

    def reset(self):
        # Reset enemy position to the top of the screen with a random x-coordinate
        self.x = random.randint(0, SCREEN_WIDTH - ENEMY_SIZE)
        self.y = -ENEMY_SIZE
