# GeoVerse Lite – Simple Country Explorer

GeoVerse Lite is a fully functional, clean, and responsive web application built with Python Flask, HTML5, CSS3, and Vanilla JavaScript. It integrates the public **REST Countries API** for data and **Leaflet.js** with dark mode tiles for interactive map visualizations.

## Features

- **Home Page (`/`)**: Displays all world countries sorted alphabetically in a sleek glassmorphic card grid. Includes a real-time, instant JavaScript-based search filter.
- **Detail Page (`/country/<name>`)**: Shows essential details about a selected country (Capital, Population, Region, Currency, Languages) alongside an interactive leaflet map centered automatically, complete with a custom marker for the capital city.
- **Optimized UI**: Tailored dark mode background (`#0f172a`), beautiful micro-interactions, responsive mobile layout, and premium typography using Google Fonts (Outfit).

## Project Structure

```text
GeoVerseLite/
├── venv/                 # Python virtual environment (MSYS2-based)
├── app.py                # Flask application routes
├── requirements.txt     # Python dependencies
├── README.md             # Project documentation
├── templates/
│   ├── index.html        # Main list template
│   └── country.html      # Details and map template
└── static/
    ├── css/
    │   └── style.css     # Main stylesheet (including Leaflet custom styles)
    └── js/
        └── main.js       # Main Javascript file (API fetches, search, and Leaflet maps)