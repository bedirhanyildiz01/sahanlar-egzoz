import os
from PIL import Image

def remove_background(image_path, output_path):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} does not exist")
        return
        
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    pixels = list(img.getdata())
    
    # Background threshold: light color (R, G, B > 120)
    # The wood textured wall is off-white/gray, so R, G, B are high and close to each other.
    def is_bg_color(color):
        r, g, b, a = color
        # Also check if it's already transparent
        if a == 0:
            return True
        # Background is light gray/white/wood textures
        # Let's use a threshold. Red shield has high red and low green/blue, so it won't match.
        # Exhaust muffler is dark steel, so it won't match.
        return r > 120 and g > 120 and b > 120
        
    # Queue-based flood fill from all four edges of the image
    visited = set()
    queue = []
    
    # Add all edge pixels as starting points
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        
    # Mark edge pixels as visited
    for x, y in queue:
        visited.add((x, y))
        
    # Process queue
    while queue:
        x, y = queue.pop(0)
        idx = y * width + x
        color = pixels[idx]
        
        if is_bg_color(color):
            # Convert to transparent
            pixels[idx] = (0, 0, 0, 0)
            
            # Check 8-connected neighbors
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    if dx == 0 and dy == 0:
                        continue
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height:
                        if (nx, ny) not in visited:
                            n_idx = ny * width + nx
                            n_color = pixels[n_idx]
                            if is_bg_color(n_color):
                                visited.add((nx, ny))
                                queue.append((nx, ny))
                                
    # Let's save the transparent logo
    img.putdata(pixels)
    img.save(output_path, "PNG")
    print(f"Background successfully removed and saved to {output_path}")

if __name__ == "__main__":
    remove_background("public/logo.png", "public/logo-transparent.png")
