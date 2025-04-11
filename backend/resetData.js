const fs = require("fs");
const path = require("path");

// Define the paths to your CSV files
const csvFiles = [
    path.join(__dirname, "data", "users.csv"),
    path.join(__dirname, "data", "itineraries.csv"),
    path.join(__dirname, "data", "events.csv"),
    path.join(__dirname, "data", "friend_requests.csv"),
    path.join(__dirname, "data", "favourties.csv"),
    path.join(__dirname, "data", "events.csv"),
];


// Define default content for each CSV file
const defaultContent = {
    "users.csv": `id,email,password,first_name,last_name,phone_number,traveller_type,bio,friends
1,wendy@gmail.com,Wendy123!,Wendy,Wanderer,123-456-7890,Solo Traveler,I love spontaneous and adventurous trips!,"[{""email"":""alex@gmail.com"",""favorite"":false},{""email"":""nick@gmail.com"",""favorite"":true}]"
2,nick@gmail.com,Nick123!,Nick,Niche,403-123-4567,Local Traveler,I love finding hidden gems in Calgary!,
3,alex@gmail.com,Alex123!,Alex,Analyst,098-765-4321,International Traveler,"Hey, I'm Alex! Looking for international travel buddies!","[{""email"":""wendy@gmail.com"",""favorite"":false}, {""email"":""omar@gmail.com"",""favorite"":false}]"
4,omar@gmail.com,Omar123!,Omar,Organizer,888-123-4567,Group Traveler,I love organizing group trips!,"[{""email"":""wendy@gmail.com"",""favorite"":false}]"
"`,

    "itineraries.csv": `itinerary_id,user_email,trip_title,trip_description,start_date,end_date,destinations,shared_with
1,wendy@gmail.com,Calgary,"Explore downtown Calgary, visit the best local spots, explore music.",04/12/2025,04/14/2025,,"[{""email"":""nick@gmail.com"",""access"":""trip-mate"",""friend_name"":""Nick"",""owner_name"":""Wendy""}]"
2,alex@gmail.com,Banff,"Take the Banff Gondola for stunning mountain views and soak in the Banff Hot Springs. Hike through Johnston Canyon and spot wildlife along the scenic trails.",04/21/2025,04/28/2025,,"[{""email"":""wendy@gmail.com"",""access"":""viewer"",""friend_name"":""Wendy"",""owner_name"":""Alex""}]"
3,nick@gmail.com,Canmore,"Enjoy breathtaking views at Grassi Lakes and explore Quarry Lake. Discover local cafés, art galleries, and scenic biking trails around the town.",03/28/2025,03/30/2025,,"[{""email"":""wendy@gmail.com"",""access"":""trip-mate"",""friend_name"":""Wendy"",""owner_name"":""Nick""}]"
4,nick@gmail.com,Brunch & Books,"Just a couple besties going to grab brunch and book shop!",04/11/2025,04/11/2025,,"[{""email"":""wendy@gmail.com"",""access"":""trip-mate"",""friend_name"":""Wendy"",""owner_name"":""Nick""}]"


    `,
    "events.csv": `event_id,itinerary_id,title,description,address,contact,hours,price,rating,rating_count,tags,image_path,start_date,start_time,end_date,end_time


1,4,OEB Breakfast Co.,"OEB was established in 2009; in Calgary – a Canadian city with big potential and small-town values. The people at OEB possess a deep love of food, giving staff the confidence to excite and welcome guests. The OEB menu is purposeful, filled with items that simply can't be made at home, balanced by lighter fare and vegan options. The people at OEB possess a deep love of food, giving staff the confidence to excite and welcome guests.",2207 4 St SW,(403) - 222 - 3333,"Monday - Sunday, 9:00AM - 7:00PM",$$,4.8,120,"[""Vegan"",""Brunch"",""CozyVibes"",""Family-Friendly"",""PhotoReady""]",food.png,04/11/2025,10:00 AM (MST),04/11/2025,11:30 AM (MST)
2,4,Pages Bookstore,"Pages Bookstore is a charming independent bookshop in Kensington, Calgary featuring a curated selection of books with focus on local authors. The cozy space offers reading nooks, an in-store café, and hosts regular community events including author readings and book clubs. With knowledgeable staff and a warm atmosphere, it has become a beloved cultural hub in this vibrant neighborhood.",1135 Kensington Road NW,(403) - 268 - 4100,"Tuesday - Sunday, 10:00AM - 5:00PM",$,4.9,71,"[""Literature"",""Charming"",""LocalAuthors"",""CozySpace"",""CommunityEvents""]",books.png,04/11/2025,12:00 PM (MST),04/11/2025,2:00 PM (MST)
3,1,GRETA Bar,"GRETA Bar is a vibrant arcade-themed bar in downtown Calgary combining nostalgic gaming with modern dining. The venue features classic arcade games, pinball machines, and interactive activities alongside craft beers and creative cocktails. Known for its lively atmosphere and shareable street food menu, it's a popular hotspot for both casual outings and special events, offering a perfect blend of entertainment and nightlife.",213 10 Ave SW,(403) - 244 - 0444,"Monday - Friday, 9:00PM - 2:00AM",$$$,4.8,576,"[""Pub"",""NightLife"",""ComfortFood"",""Trendy"",""Chill"",""GamesNight"",""Group-Friendly""]",beer.png,04/12/2025,8:00 PM (MST),04/12/2025,11:00 PM (MST)
1744362646306,1,Studio Bell,"Studio Bell is home to the National Music Centre, a landmark cultural destination dedicated to celebrating music in Canada. The architecturally stunning building houses over 2,000 rare instruments and artifacts, interactive exhibits, recording facilities, and performance spaces. Visitors can explore Canada's rich musical history and experience the power of music through innovative installations.",300-851 4 Street SE,(403) - 770 - 1333,"Wednesday - Sunday, 11:00AM - 5:00PM",$,4.6,120,"[""Music"",""Entertainment"",""Community"",""DateNight"",""Child-Friendly""]",music.png,04/13/2025,12:00 PM (MST),04/13/2025,3:00 PM (MST)
    
    `,
    
    "friend_requests.csv": `id,from_email,to_email\n
1,omar@gmail.com,wendy@gmail.com
    `,

};


// Function to reset a CSV file
const resetFile = (filePath, defaultData) => {
    fs.writeFile(filePath, defaultData, (err) => {
        if (err) {
            console.error(`Failed to reset ${filePath}:`, err);
        } else {
            console.log(`${filePath} has been reset.`);
        }
    });
};

// Reset each CSV file
csvFiles.forEach((file) => {
    const fileName = path.basename(file);
    const content = defaultContent[fileName] || "";
    resetFile(file, content);
});