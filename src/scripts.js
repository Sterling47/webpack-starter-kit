import './css/styles.css';
import { fetchDestinations, fetchTripsData, submitNewTrip, fetchTravelerById } from './apiCalls';
import { findTravelersTrips } from './travelerFunctions';
import { destinationOptions, displayTotalEstimate, renderTrips } from './dom';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const dashboard = document.getElementById('dashboard');
    const userIdElement = document.getElementById('user-id');
    const totalAmountElement = document.getElementById('total-amount');
    const travelForm = document.querySelector('.form-card');
    const newTripForm = document.querySelector('.new-trip-form');
    const estimateButton = document.querySelector('.estimate-bttn')
    
    let userId;
    let destinationsData;
    

    fetchDestinations()
        .then(destinations => {
            destinationsData = destinations; 
            destinationOptions(destinations);
        });

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;
        userId = username.slice(8);

        if (userId && password === 'travel') {
            fetchTravelerById(userId)
                .then(traveler => {
                    loginForm.parentElement.classList.add('hidden');
                    dashboard.classList.remove('hidden');
                    travelForm.classList.remove('hidden');
                    userIdElement.innerText = `Hi, ${traveler.name}`;
                    fetchTravelersData(userId);
                })
                .catch(error => {
                    alert('Invalid username or password');
                });
        } else {
            alert('Invalid username or password');
        }
    });

    newTripForm.addEventListener('submit', (e) => submitNewTrip(e, Number(userId), destinationsData)); // Pass destinationsData to submitNewTrip
    estimateButton.addEventListener('click', e => displayTotalEstimate(e, destinationsData))
    


    function fetchTravelersData(userId) {
        Promise.all([fetchTripsData(), fetchDestinations()])
            .then(([tripsData, destinationsData]) => {
                const travelerTrips = findTravelersTrips(Number(userId), tripsData.trips);

                const pastTrips = document.getElementById('past-trips');
                const upcomingTrips = document.getElementById('upcoming-trips');
                const pendingTrips = document.getElementById('pending-trips');

                pastTrips.innerHTML = '';
                upcomingTrips.innerHTML = '';
                pendingTrips.innerHTML = '';

                let totalAmount = 0;

                totalAmount += renderTrips(travelerTrips.past, pastTrips, destinationsData);
                totalAmount += renderTrips(travelerTrips.upcoming, upcomingTrips, destinationsData);
                totalAmount += renderTrips(travelerTrips.pending, pendingTrips, destinationsData);

                totalAmount *= 1.1;
                totalAmountElement.innerText = `You spent $${totalAmount.toFixed(2)} on all trips this year!`;
            })
            .catch(error => console.error('Error fetching trip data:', error));
    }

    const buttons = document.querySelectorAll('.trip-nav button');
    const sections = document.querySelectorAll('.trip-bar');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active'); 
        sections.forEach(section => section.classList.add('hidden'));
        const targetId = button.getAttribute('data-target') + '-section';
        document.getElementById(targetId).classList.remove('hidden');
      });
    });
});
