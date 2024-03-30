import pygame
import sys
import random

# Initialize Pygame
pygame.init()

# Set up the screen
screen_width = 800
screen_height = 600
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("Frontline Drone")

# Load drone image
drone_image = pygame.image.load("drone.png")  # Replace "drone.png" with the filename of your drone image
# Resize the drone image
drone_size = (screen_width // 10, screen_width // 10)
drone_image = pygame.transform.scale(drone_image, drone_size)
drone_rect = drone_image.get_rect()
drone_rect.centerx = screen_width // 2
drone_rect.centery = screen_height // 2

# Load grenade image
grenade_image = pygame.image.load("grenade.png")  # Replace "grenade.png" with the filename of your grenade image
# Resize the grenade image
grenade_size = (100, 100)  # Adjust the size as needed
grenade_image = pygame.transform.scale(grenade_image, grenade_size)

# Set up colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
DARK_GREEN = (20, 70, 20)  # Adjusted green color for a military-like background
GRAY = (128, 128, 128)

# Set up game variables
clock = pygame.time.Clock()
is_running = True

# Set up movement variables
drone_speed = 5
prev_drone_x = drone_rect.centerx

# Function to draw a pair of parallel lines representing a trench line
def draw_trench_line(start_x, end_x, y, width):
    pygame.draw.line(screen, GRAY, (start_x, y), (end_x, y), width)
    pygame.draw.line(screen, GRAY, (start_x, y + 5), (end_x, y + 5), width)

# Function to drop grenades
def drop_grenade(drone_rect):
    screen.blit(grenade_image, (drone_rect.centerx - grenade_size[0] / 2, drone_rect.centery - grenade_size[1] / 2))  # Adjust position to center the grenade image

# Generate trench lines positions
trench_lines = []
for _ in range(25):
    start_x = random.randint(0, screen_width)
    end_x = start_x + random.randint(50, 150)
    y = random.randint(screen_height * 2 // 3, screen_height - 10)
    trench_lines.append((start_x, end_x, y))


# Main game loop
while is_running:
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            is_running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:  # Drop grenade when spacebar is pressed
                drop_grenade(drone_rect)  # Pass the drone's position to drop_grenade function


    # Get the state of all keyboard keys
    keys = pygame.key.get_pressed()

    # Update drone position based on arrow key presses
    if keys[pygame.K_UP]:
        drone_rect.centery -= drone_speed
    if keys[pygame.K_DOWN]:
        drone_rect.centery += drone_speed
    if keys[pygame.K_LEFT]:
        drone_rect.centerx -= drone_speed
    if keys[pygame.K_RIGHT]:
        drone_rect.centerx += drone_speed

    # Check if drone has moved out to the right or left of the screen
    if drone_rect.centerx > screen_width or drone_rect.centerx < 0:
        # If drone moved out, update the previous drone position and redraw trench lines
        prev_drone_x = drone_rect.centerx

    # Clear the screen
    screen.fill(DARK_GREEN)  # Fill the screen with dark green for a military-like background
 # Draw trench lines
    for start_x, end_x, y in trench_lines:
        draw_trench_line(start_x, end_x, y, 3)

    # Draw the drone
    screen.blit(drone_image, drone_rect)

    # Update display
    pygame.display.flip()

    # Cap the frame rate
    clock.tick(60)

# Quit Pygame
pygame.quit()
sys.exit()
