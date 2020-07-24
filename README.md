# Summary

Title: Nom Finder

Description: The backend for a light weight app that focuses on tracking and organizing one's favorite food truck events.

## Purpose

To store menu items, calendar events, and saved user favorite events. Currently supports retrieval of menu items, calendar events, and user saved favorite events. Also supports adding and removing favorite events based on a demo user id.


## Built With

* Express
* PostgreSQL

## Active Features/Endpoints
Endpoints currently used for this version of the app:

/menu
* Reads from the nomfinder_menu_items table

/calendar
* Reads from the nomfinder_events table and returns any row with a start date that occurs after now

/calendar/fav/:user_id
* Reads from the nomfinder_favorite_events table and returns only fav'd events for the provided user id (currently test uid 1)

/calendar/fav/:user_id/:event_id
* handles post requests for adding new favorite events by user id
* handles delete requests for removing favorite events by user id


Endpoints in development, not currently live but in the repo:

/menu
* will be able to handle post requests for adding new menu items (for future admin functionality)

/menu/:item_id
* handles delete and patch requests for existing menu items (for future admin functionality)

/calendar
* post request handling for new events (admin functionality)

/calendar/:event_id
* get, delete, and patch handling for editing or deleting an event. Get was set up to eventually have a full page display dedicated to any additional event details

## Demo

- [Live Demo](https://my-nom-finder.vercel.app/)