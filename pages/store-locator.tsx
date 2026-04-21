import type { NextPage, GetStaticProps } from 'next';
import { serverSideTranslations } from '../lib/i18n';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import styles from '../styles/store-locator.module.css';

type Store = {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  website: string;
  badge: string | null;
};

function buildDirectionsUrl(s: Store): string {
  const q = encodeURIComponent(`${s.name}, ${s.address}, ${s.city}${s.state ? ', ' + s.state : ''}`);
  return `https://maps.google.com/?q=${q}`;
}

const stores: Store[] = [
  { id: 1, name: 'Persona Medical Earasers Headquarters', address: '170 N Cypress Way', city: 'Casselberry', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 2, name: 'A Sharp Music Co', address: '204 SW 43rd St', city: 'Renton', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 3, name: 'Academy of Modern Music Production', address: '1350 South Longmore, Suite 13', city: 'Mesa', state: 'AZ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 4, name: 'Academy of the Percussive Arts', address: '6769 Stage Rd', city: 'Memphis', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 5, name: 'Access Percussion', address: '1203 Rogers Street', city: 'Columbia', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 6, name: 'ADVANCED QUALITY HEARING SYSTEMS', address: '2900 W SAMPLE RD #0129', city: 'POMPANO BEACH', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 7, name: 'Alden Technology Co Ltd', address: '2F, 17 Yen Ping South Road', city: 'Taipei', state: 'Taiwan', country: 'Taiwan', countryCode: 'TW', website: '', badge: null },
  { id: 8, name: 'Alto Music (NY - Middletown)', address: '180 Carpenter Ave', city: 'Middletown', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 9, name: 'AMERICAN DENTAL ACCESSORIES, INC', address: '7310 Oxford Street', city: 'Minneapolis', state: 'MN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 10, name: 'American Guitar Boutique', address: '707 13th St', city: 'Phenix City', state: 'AL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 11, name: 'American Music', address: '128-A N. Marine Corps Dr.', city: 'Tamuning', state: '', country: 'Guam', countryCode: 'GU', website: '', badge: null },
  { id: 12, name: 'American Musical Supply', address: '8 Thornton Road', city: 'Oakland', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 13, name: 'AMP CHAMP PRO AV', address: '3900 Magnolia St Unit D', city: 'Denver', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 14, name: 'Art\'s Music Shop Inc', address: '3030 East Blvd', city: 'Montgomery', state: 'AL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 15, name: 'Artisan HearingTechnologies', address: '508-B West Southern Ave', city: 'S. Williamsport', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 16, name: 'Artworks Korea, INC', address: '539 Cheonggyecheon-ro', city: 'Seoul', state: '', country: 'South Korea', countryCode: 'KR', website: '', badge: null },
  { id: 17, name: 'ASSOCIATED TERMINALS', address: '9100 Safety Drive', city: 'Convent', state: 'LA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 18, name: 'Audiology By Accent', address: '4340 Newberry Rd, Suite 301', city: 'Gainesville', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 19, name: 'Avalanche Industries', address: '144 Dixon Street', city: 'Selbyville', state: 'DE', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 20, name: 'Avian Guitars Canada', address: '1121 Velley Mist Ct. Suite 205', city: 'Oakville', state: 'Ontario', country: 'Canada', countryCode: 'CA', website: '', badge: null },
  { id: 21, name: 'B&H Photo Video', address: '420 9th Ave at 34th St', city: 'New York', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 22, name: 'Bananas At Large', address: '1654 2nd Street', city: 'San Rafael', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 23, name: 'Baums Music', address: '2908 Eubank Blvd NE', city: 'Albuquerque', state: 'NM', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 24, name: 'Baxter Hearing Specialists, LLC', address: '1211 South Main Street', city: 'Weatherford', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 25, name: 'Bella Internacional LLC', address: 'Ave. 65 Infantery, Esq. Trujillo Alto', city: 'San Juan', state: '', country: 'Puerto Rico', countryCode: 'PR', website: '', badge: null },
  { id: 26, name: 'Bellbrook Music Boosters', address: '2261 South Linda Drive', city: 'Bellbrook', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 27, name: 'Better Hearing Center', address: '3412 E Market St.', city: 'York', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 28, name: 'Big Bang Distribution', address: '9420 Reseda Blvd', city: 'Northridge', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 29, name: 'Bigfoot Music', address: '3405 172nd Street NE #21', city: 'Arlington', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 30, name: 'Bill Hardin Music', address: '4661 Chambers Road', city: 'Macon', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 31, name: 'Blackstone-Millville Reg Schools', address: '175 LINCOLN ST', city: 'Blackstone', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 32, name: 'Bluecoats', address: 'PO Box 2733', city: 'North Canton', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 33, name: 'Brass Bell Music, Inc.', address: '210 W Silver Spring Dr.', city: 'Milwaukee', state: 'WI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 34, name: 'BRIDGE HEARING', address: '12252 SE 114th Street', city: 'Ocklawaha', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 35, name: 'BRIGHTON MUSIC CENTER', address: '1015 THIRD AVE', city: 'NEW BRIGHTON', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 36, name: 'Buckeye Brass & Winds', address: '202 N. Chilicothe Street', city: 'Plain City', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 37, name: 'Bud\'s Music Center', address: '820 Main St', city: 'Hopkins', state: 'MN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 38, name: 'C&M Music Center', address: '2515 Williams Blvd', city: 'Kenner', state: 'LA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 39, name: 'Cadence Music', address: '5215 Ramsey Way', city: 'Fort Myers', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 40, name: 'Capital Books and Wellness', address: '573 W Crete Cir Unit 104o', city: 'Grand Junction', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 41, name: 'Chicago Music Exchange', address: '3316 N Lincoln Ave', city: 'Chicago', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 42, name: 'Chippewa Valley H.S. Band', address: '18300 19 Mile Road', city: 'Clinton Township', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 43, name: 'CLARATONE DEUTSCHLAND UG', address: 'SOSSENHEIMER WEG 4F', city: '', state: '', country: 'Germany', countryCode: 'DE', website: '', badge: null },
  { id: 44, name: 'Clark Hearing Inc.', address: '33300 Egypt Lane Ste. 200', city: 'Magnolia', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 45, name: 'Coda Room Audio', address: '2408 W. Sibley St', city: 'Park Ridge', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 46, name: 'Columbus Pro Percussion Inc.', address: '5052 North High Street', city: 'Columbus', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 47, name: 'Corner Music, Inc.', address: '3048 Dickerson Road', city: 'Nashville', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 48, name: 'Cosmo Music Co. Ltd', address: '10 Via Renzo Drive', city: 'Richmond Hill', state: 'ON', country: 'Canada', countryCode: 'CA', website: '', badge: null },
  { id: 49, name: 'Counts Brothers Music', address: '713 Waverly Ave', city: 'Muscle Shoals', state: 'AL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 50, name: 'Cross Roads Music', address: '2100 Lawrence Street', city: 'Port Townsend', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 51, name: 'Dan\'s Guitars', address: '2000 S Beretania St, Unit B', city: 'Honolulu', state: 'HI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 52, name: 'Dave\'s Drum Shop Incs', address: '270 Catherine St, Unit 2', city: 'Ottawa', state: 'ON', country: 'Canada', countryCode: 'CA', website: '', badge: null },
  { id: 53, name: 'DJ CITY', address: '318-320 HAMMOND RD', city: 'DANDENONG', state: '', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 54, name: 'DJ City Dandenong South Store', address: '318 Hammond Rd', city: 'Dandenong South', state: 'VIC', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 55, name: 'DJ City Mansfield Store', address: '3/22 Hugo Place', city: 'Mansfield', state: 'QLD', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 56, name: 'DJ City Oakleigh Store', address: '39 Regent St', city: 'Oakleigh', state: 'VIC', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 57, name: 'DJ City Richmond Store', address: '14/2 Bromham Place', city: 'Richmond', state: 'VIC', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 58, name: 'DJ City Ringwood Store', address: '2/401 Maroondah Hwy', city: 'Ringwood', state: 'VIC', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 59, name: 'DJ City Smithfield Store', address: '3/723 The Horsley Dr', city: 'Smithfield', state: 'NSW', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 60, name: 'DOWN EAST HEARING CARE ASSOCI, INC.', address: '1356 BENVENUE ROAD', city: 'ROCKY MT.', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 61, name: 'Drum Center of Portsmouth', address: '144 Lafayette Road', city: 'North Hampton', state: 'NH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 62, name: 'Duran Central Pharmacy', address: '1815 Central Ave', city: 'Albuquerque', state: 'NM', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 63, name: 'Dynamic Music', address: 'PO Box 651', city: 'Brookvale', state: 'NSW', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 64, name: 'E.A.R., INC.', address: '5763 Arapahoe Ave', city: 'Boulder', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 65, name: 'Ear Fit Hearing Aids', address: 'Liorna 41, Interior 3', city: 'Del. Tlalpan', state: '', country: 'Mexico', countryCode: 'MX', website: '', badge: null },
  { id: 66, name: 'Ear Plug Superstore', address: '1709 Bell Road', city: 'Fort Gibson', state: 'OK', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 67, name: 'Earasers Australia', address: '1/79 Victoria St', city: 'Brisbane', state: 'QLD', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 68, name: 'EARJOB', address: '5/2 BOLTON STREET', city: 'SYDENHAM', state: 'NSW', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 69, name: 'EARTECH horselkliniker AB', address: 'GARDSFOGDEVAGAN 18 C', city: 'BROMMA', state: '', country: 'Sweden', countryCode: 'SE', website: '', badge: null },
  { id: 70, name: 'Earthshaking Music Inc.', address: '648 McDonough Blvd SE', city: 'Atlanta', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 71, name: 'East Lab LLC', address: '1759 OceanSide Blvd C177', city: 'Oceanside', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 72, name: 'El Camino School of Music', address: '7905 Guardsmen Street', city: 'Orlando', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 73, name: 'Electro Net Inc.', address: '155 Jefferson St Suite 1', city: 'San Francisco', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 74, name: 'Entry-Japan K.K.', address: '6F Matsuki Building', city: 'Shinjuku', state: 'Tokyo', country: 'Japan', countryCode: 'JP', website: '', badge: null },
  { id: 75, name: 'Epic Percussion', address: '844 W. 4th St', city: 'Williamsport', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 76, name: 'Expert Voice', address: '9 Exchange Pl', city: 'Salt Lake City', state: 'UT', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 77, name: 'FIDDLERSHOP', address: '2703 Gateway Drive', city: 'POMPANO BEACH', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 78, name: 'Flute Specialists, Inc.', address: '606 S. Rochester Rd', city: 'Clawson', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 79, name: 'Frontline Eurosports', address: '1003 Electric Road', city: 'Salem', state: 'VA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 80, name: 'FUND.NACIONAL PRO CALIDAD VIDA YBN SOCIAL AC', address: 'PERIFERICO SUR, #4091, AlCALDIA TLALPAN', city: 'Mexico City', state: '', country: 'Mexico', countryCode: 'MX', website: '', badge: null },
  { id: 81, name: 'Gary Underwood Music', address: '4949 N. Pine Ave', city: 'Winter Park', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 82, name: 'Gateway BMW', address: '2690 Masterson Ave.', city: 'St. Louis', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 83, name: 'Gator Harley Davidson', address: '1745 US Hwy 441', city: 'Leesburg', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 84, name: 'Gelb Music', address: '722 El Camino Real', city: 'Redwood City', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 85, name: 'Gio SHOP', address: '241 S. Rosemead Blvd', city: 'Pasadena', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 86, name: 'Green Elephant Studio', address: '1478 SPICETREE CR #104', city: 'FAIRBORN', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 87, name: 'Griggs Music Inc.', address: '3849 Brady Street', city: 'Davenport', state: 'IA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 88, name: 'Groth Music Co', address: '8056 Nicollet Ave S', city: 'Bloomington', state: 'MN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 89, name: 'GUITAR CENTER - ASHEVILLE', address: '4 South Tunnel RD Suite 430', city: 'Asheville', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 90, name: 'GUITAR CENTER - AKRON', address: '3750 W. Market St. Unit R', city: 'Fairlawn', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 91, name: 'GUITAR CENTER - ALBANY', address: '145 Wolf Road', city: 'Colonie', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 92, name: 'GUITAR CENTER - ALBUQUERQUE', address: '6001 Menaul Blvd', city: 'Albuquerque', state: 'NM', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 93, name: 'GUITAR CENTER - ALGONQUIN', address: '195 S. Randall Rd', city: 'Algonquin', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 94, name: 'GUITAR CENTER - ALLEN PARK', address: '23133 Outer Dr., Unit D', city: 'Allen Park', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 95, name: 'GUITAR CENTER - ALLENTOWN', address: '250 Lehigh Valley Mall Space 720', city: 'Whitehall', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 96, name: 'GUITAR CENTER - ALPHARETTA', address: '970 North Point Dr. Suite A120', city: 'Alpharetta', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 97, name: 'GUITAR CENTER - AMARILLO', address: '3350 S. Soncy Rd #176', city: 'Amarillo', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 98, name: 'GUITAR CENTER - APPLETON', address: '775 N. Casaloma Dr.', city: 'Grand Chute', state: 'WI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 99, name: 'GUITAR CENTER - ARLINGTON', address: '721 Ryan Plaza Dr.', city: 'Arlington', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 100, name: 'GUITAR CENTER - ARVADA', address: '8601 Sheridan Blvd., Suite G', city: 'Arvada', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 101, name: 'GUITAR CENTER - ATHENS', address: '1791 Oconee Connector, Suite 450', city: 'Athens', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 102, name: 'GUITAR CENTER - ATLANTA', address: '1485 Northeast Expressway', city: 'Atlanta', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 103, name: 'GUITAR CENTER - ATLANTIC CITY', address: '560 Hamilton Commons', city: 'Mays Landing', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 104, name: 'GUITAR CENTER - AUSTIN', address: '2525 West Anderson Lane Suite 200', city: 'Austin', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 105, name: 'GUITAR CENTER - AVONDALE', address: '9945 W. McDowell Rd. Suite 108', city: 'Avondale', state: 'AZ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 106, name: 'GUITAR CENTER - BAKERSFIELD', address: '3428 Ming Avenue', city: 'Bakersfield', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 107, name: 'GUITAR CENTER - BATON ROUGE', address: 'Cortana Shpng Cntr 9001 Florida Bl.', city: 'Baton Rouge', state: 'LA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 108, name: 'GUITAR CENTER - BEAUMONT', address: '4025 Dowlen Rd.', city: 'Beaumont', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 109, name: 'GUITAR CENTER - BEAVERTON', address: '9575 S.W. Cascade Ave.', city: 'Beaverton', state: 'OR', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 110, name: 'GUITAR CENTER - BELLINGHAM WA', address: '3960 Meridian St. Suite 101', city: 'Bellingham', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 111, name: 'GUITAR CENTER - BERKLEE', address: '159 Massachusetts Ave', city: 'Boston', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 112, name: 'GUITAR CENTER - BIRMINGHAM', address: '1694 Montgomery Highway', city: 'Hoover', state: 'AL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 113, name: 'GUITAR CENTER - BLOCK AT ORANGE', address: '20 City Blvd W Ste 907D', city: 'Orange', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 114, name: 'GUITAR CENTER - BOISE', address: '5761 Fairview Avenue', city: 'Boise', state: 'ID', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 115, name: 'GUITAR CENTER - BOSTON', address: '1255 Boylston St.', city: 'Boston', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 116, name: 'GUITAR CENTER - BRAINTREE', address: '255 Grossman Dr.', city: 'Braintree', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 117, name: 'GUITAR CENTER - BREA', address: '606 S. Brea Blvd.', city: 'Brea', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 118, name: 'GUITAR CENTER - BRIDGETON', address: '11977 St. Charles Rock Rd.', city: 'Bridgeton', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 119, name: 'GUITAR CENTER - BROOKFIELD', address: '17135 West Bluemound Road., Suite A', city: 'Brookfield', state: 'WI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 120, name: 'GUITAR CENTER - BROOKLYN', address: '139 Flatbush Ave.', city: 'Brooklyn', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 121, name: 'GUITAR CENTER - BROWNSVILLE', address: '1601 E. Price Rd., Suite H', city: 'Brownsville', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 122, name: 'GUITAR CENTER - BUFFALO', address: '1092 Niagara Falls Blvd.', city: 'Tonawanda', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 123, name: 'GUITAR CENTER - CANTON', address: '39415 Ford Road', city: 'Canton Township', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 124, name: 'GUITAR CENTER - CARLE PLACE', address: '111 Old Country Rd.', city: 'Carle Place', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 125, name: 'GUITAR CENTER - CEDAR RAPIDS', address: '4651 1st Ave SE', city: 'Cedar Rapids', state: 'IA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 126, name: 'GUITAR CENTER - CENTRAL CHICAGO', address: '2633 North Halsted', city: 'Chicago', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 127, name: 'GUITAR CENTER - CENTRAL DALLAS', address: '7814 North Central Expressway', city: 'Dallas', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 128, name: 'GUITAR CENTER - CERRITOS', address: '11159 183rd Street', city: 'Cerritos', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 129, name: 'GUITAR CENTER - CHARLESTON', address: '7620 Rivers Ave., Unit 140', city: 'North Charleston', state: 'SC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 130, name: 'GUITAR CENTER - CHARLOTTE', address: '10050 E. Independence Boulevard', city: 'Matthews', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 131, name: 'GUITAR CENTER - CHATTANOOGA', address: '2200 Hamilton Place Blvd.', city: 'Chattanooga', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 132, name: 'GUITAR CENTER - CHEEKTOWAGA', address: '3385 Union Rd. Suite 300', city: 'Cheektowaga', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 133, name: 'GUITAR CENTER - CHERRY HILL', address: '2100 NJ-38', city: 'Cherry Hill', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 134, name: 'GUITAR CENTER - CHICO', address: '2027 Dr. Martin Luther King Jr Pkwy Ste 119', city: 'Chico', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 135, name: 'GUITAR CENTER - CINCINNATI', address: '640 Kemper Commons Circle, Unit #9', city: 'Cincinnati', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 136, name: 'GUITAR CENTER - CLACKAMAS', address: '13029 Southeast 84th Ave.', city: 'Clackamas', state: 'OR', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 137, name: 'GUITAR CENTER - CLEARLAKE', address: '1020 W. Nasa Road One #138', city: 'Webster', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 138, name: 'GUITAR CENTER - CLEARWATER', address: '21335 US Hwy 19 North', city: 'Clearwater', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 139, name: 'GUITAR CENTER - COCONUT CREEK', address: '4449 Lyons Road, Suite J-106', city: 'Coconut Creek', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 140, name: 'GUITAR CENTER - COLLEGE STATION', address: '1003 Harvey RD STE 100', city: 'College Station', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 141, name: 'GUITAR CENTER - COLORADO SPRINGS', address: '535 N. Academy Blvd.', city: 'Colorado Springs', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 142, name: 'GUITAR CENTER - COLUMBUS', address: '4661 Morse Centre Drive', city: 'Columbus', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 143, name: 'GUITAR CENTER - COMMACK', address: '8 Garet Place', city: 'Commack', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 144, name: 'GUITAR CENTER - CONCORD', address: '1280 Willow Pass Rd., Suite B', city: 'Concord', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 145, name: 'GUITAR CENTER - COOL SPRINGS', address: '8105 Moores Lane Suite 1400', city: 'Brentwood', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 146, name: 'GUITAR CENTER - CORPUS CHRISTI', address: '4127 S. Staples Street', city: 'Corpus Christi', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 147, name: 'GUITAR CENTER - COUNTRY CLUB HILLS', address: '4271 W. 167th St.', city: 'Country Club Hills', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 148, name: 'GUITAR CENTER - COVINA', address: '1054 North Azusa Ave.', city: 'Covina', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 149, name: 'GUITAR CENTER - CRESTWOOD', address: '9177 Watson Rd.', city: 'St. Louis', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 150, name: 'GUITAR CENTER - DALLAS', address: '4519 LBJ Freeway', city: 'Farmers Branch', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 151, name: 'GUITAR CENTER - DANBURY', address: '15 Backus Avenue', city: 'Danbury', state: 'CT', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 152, name: 'GUITAR CENTER - DANVERS', address: '120 Andover St.', city: 'Danvers', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 153, name: 'GUITAR CENTER - DAVENPORT', address: '3860 Elmore Ave', city: 'Davenport', state: 'IA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 154, name: 'GUITAR CENTER - DAYTON', address: '2700 Miamisburg Centerville Rd, Spc 570', city: 'Dayton', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 155, name: 'GUITAR CENTER - DENVER', address: '1585 S. Colorado Blvd.', city: 'Denver', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 156, name: 'GUITAR CENTER - DES MOINES', address: '3910 University Ave.', city: 'West Des Moines', state: 'IA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 157, name: 'GUITAR CENTER - DETROIT', address: '31940 Gratiot Ave., Suite A', city: 'Roseville', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 158, name: 'GUITAR CENTER - DURHAM', address: '1720 Guess Rd.', city: 'Durham', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 159, name: 'GUITAR CENTER - EAST BRUNSWICK', address: '666 Route 18', city: 'East Brunswick', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 160, name: 'GUITAR CENTER - EDINA', address: '3650 Hazelton Rd.', city: 'Edina', state: 'MN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 161, name: 'GUITAR CENTER - EL PASO', address: '6440 Gateway Blvd. E #100', city: 'El Paso', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 162, name: 'GUITAR CENTER - EMERYVILLE', address: '5925 Shellmound St.', city: 'Emeryville', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 163, name: 'GUITAR CENTER - ENGLEWOOD', address: '9647 E. County Line Rd.', city: 'Englewood', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 164, name: 'GUITAR CENTER - EUGENE', address: '1015 Green Acres Road', city: 'Eugene', state: 'OR', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 165, name: 'GUITAR CENTER - EVANSVILLE', address: '6220 E. Lloyd Expwy #E', city: 'Evansville', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 166, name: 'GUITAR CENTER - FAIRFAX', address: '11051 Lee Highway', city: 'Fairfax', state: 'VA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 167, name: 'GUITAR CENTER - FAIRVIEW HEIGHTS', address: '79 Ludwig Dr.', city: 'Fairview Heights', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 168, name: 'GUITAR CENTER - FAYETTEVILLE', address: '186 Banks Crossing', city: 'Fayetteville', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 169, name: 'GUITAR CENTER - FAYETTEVILLE NC', address: '2093 Skibo Rd.', city: 'Fayetteville', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 170, name: 'GUITAR CENTER - FLINT', address: '3640 Miller Rd.', city: 'Flint', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 171, name: 'GUITAR CENTER - FLORENCE', address: '4999 Houston Rd.', city: 'Florence', state: 'KY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 172, name: 'GUITAR CENTER - FORT COLLINS', address: '813 E. Harmony Road', city: 'Fort Collins', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 173, name: 'GUITAR CENTER - FORT MYERS', address: '4440 Fowler Street', city: 'Fort Myers', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 174, name: 'GUITAR CENTER - FORT WAYNE', address: '422 W. Coliseum Blvd.', city: 'Fort Wayne', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 175, name: 'GUITAR CENTER - FORT WORTH', address: '5250 South Hulen Street', city: 'Fort Worth', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 176, name: 'GUITAR CENTER - FOUNTAIN VALLEY', address: '18361 Euclid St.', city: 'Fountain Valley', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 177, name: 'GUITAR CENTER - FREDERICKSBURG', address: '215 Spotsylvania Mall Dr', city: 'Fredericksburg', state: 'VA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 178, name: 'GUITAR CENTER - FRESNO', address: '5330 North Blackstone Ave.', city: 'Fresno', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 179, name: 'GUITAR CENTER - GAINESVILLE', address: '3210 SW 35th Blvd', city: 'Gainesville', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 180, name: 'GUITAR CENTER - GILROY', address: '6910 Chestnut St.', city: 'Gilroy', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 181, name: 'GUITAR CENTER - GLEN BURNIE', address: '6320 Ritchie Highway', city: 'Glen Burnie', state: 'MD', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 182, name: 'GUITAR CENTER - GRAND RAPIDS', address: '2891 Radcliff Ave SE', city: 'Kentwood', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 183, name: 'GUITAR CENTER - GREENSBORO', address: '2221 Vanstory St', city: 'Greensboro', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 184, name: 'GUITAR CENTER - GREENVILLE', address: '2463 Laurens Rd.', city: 'Greenville', state: 'SC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 185, name: 'GUITAR CENTER - GREENWOOD', address: '1256 US 31 N', city: 'Greenwood', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 186, name: 'GUITAR CENTER - GWINNETT', address: '1455 Pleasant Hill Road', city: 'Lawrenceville', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 187, name: 'GUITAR CENTER - HALLANDALE', address: '1101 W. Hallandale Beach Blvd.', city: 'Hallandale', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 188, name: 'GUITAR CENTER - HARRISBURG', address: '5082 Jonestown Road', city: 'Harrisburg', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 189, name: 'GUITAR CENTER - HIGHLAND PARK', address: '143 South Skokie Valley Road', city: 'Highland Park', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 190, name: 'GUITAR CENTER - HOBART', address: '2108 E. 80th Avenue', city: 'Merrillville', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 191, name: 'GUITAR CENTER - HOLLYWOOD', address: '7425 Sunset Blvd.', city: 'Los Angeles', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 192, name: 'GUITAR CENTER - HOUSTON', address: '8390 Westheimer Rd.', city: 'Houston', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 193, name: 'GUITAR CENTER - HUNTSVILLE', address: '5900 University Dr. NW, Suite A', city: 'Huntsville', state: 'AL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 194, name: 'GUITAR CENTER - INDEPENDENCE', address: '3911 Bolger Rd.', city: 'Independence', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 195, name: 'GUITAR CENTER - INDIANAPOLIS', address: '8475 Castleton Corner Drive', city: 'Indianapolis', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 196, name: 'GUITAR CENTER - JACKSON', address: '1189 East County Line Road, Suite 4', city: 'Jackson', state: 'MS', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 197, name: 'GUITAR CENTER - JACKSONVILLE', address: '9365 Atlantic Blvd. Suite 1', city: 'Jacksonville', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 198, name: 'GUITAR CENTER - JOHNSON CITY', address: '665 Harry L. Drive', city: 'Johnson City', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 199, name: 'GUITAR CENTER - JOLIET', address: '2785 Plainfield Rd.', city: 'Joliet', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 200, name: 'GUITAR CENTER - KALAMAZOO', address: '5800 S. Westnedge Ave.', city: 'Portage', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 201, name: 'GUITAR CENTER - KATY', address: '24429 Katy Freeway', city: 'Katy', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 202, name: 'GUITAR CENTER - KILLEEN', address: '1600 Lowes Blvd Suite 100', city: 'Killeen', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 203, name: 'GUITAR CENTER - KIRKLAND', address: '12608 120th Ave. N.E.', city: 'Kirkland', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 204, name: 'GUITAR CENTER - KNOXVILLE', address: '8917 Towne & Country Cir.', city: 'Knoxville', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 205, name: 'GUITAR CENTER - LA MESA', address: '8825 Murray Dr.', city: 'La Mesa', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 206, name: 'GUITAR CENTER - LAFAYETTE', address: '5702 Johnston St. Suite 102', city: 'Lafayette', state: 'LA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 207, name: 'GUITAR CENTER - LAKE FOREST', address: '23811 El Toro Rd. Suite A', city: 'Lake Forest', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 208, name: 'GUITAR CENTER - LAKELAND', address: '3169 US Highway 98 N', city: 'Lakeland', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 209, name: 'GUITAR CENTER - LANCASTER', address: '1292-A Millersville Pike', city: 'Lancaster', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 210, name: 'GUITAR CENTER - LANSING', address: '522 Frandor Ave', city: 'Lansing', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 211, name: 'GUITAR CENTER - LARCHMONT', address: '2141 Palmer Ave.', city: 'Larchmont', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 212, name: 'GUITAR CENTER - LAREDO', address: '5708 San Bernardo Ave', city: 'Laredo', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 213, name: 'GUITAR CENTER - LAS VEGAS', address: '6587 S. Las Vegas Blvd. Suite B-172', city: 'Las Vegas', state: 'NV', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 214, name: 'GUITAR CENTER - LEWISVILLE', address: '2601 S. Simmons Fwy #440', city: 'Lewisville', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 215, name: 'GUITAR CENTER - LEXINGTON', address: '3801 Mall Rd', city: 'Lexington', state: 'KY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 216, name: 'GUITAR CENTER - LINCOLN', address: '2801 Pine Lake Rd. Suite P2', city: 'Lincoln', state: 'NE', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 217, name: 'GUITAR CENTER - LITTLE ROCK', address: '12315 Chenal Parkway, Suite A', city: 'Little Rock', state: 'AR', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 218, name: 'GUITAR CENTER - LOUISVILLE', address: '4600 Shelbyville Road Suite 613', city: 'Louisville', state: 'KY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 219, name: 'GUITAR CENTER - LUBBOCK', address: '4930 S. Loop 289 Suite 220', city: 'Lubbock', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 220, name: 'GUITAR CENTER - LYNNWOOD', address: '18420 33rd Ave. West Suite D', city: 'Lynnwood', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 221, name: 'GUITAR CENTER - MACON', address: '4551 Billy Williamson Dr. Suite 160', city: 'Macon', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 222, name: 'GUITAR CENTER - MADISON', address: '676 S. Whitney Way #G1', city: 'Madison', state: 'WI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 223, name: 'GUITAR CENTER - MANCHESTER', address: '120.B Hale Rd.', city: 'Manchester', state: 'CT', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 224, name: 'GUITAR CENTER - MAPLE GROVE', address: '11561 Fountains Dr N', city: 'Maple Grove', state: 'MN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 225, name: 'GUITAR CENTER - MARANA', address: '3830 W. River Rd. Suite 110', city: 'Tucson', state: 'AZ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 226, name: 'GUITAR CENTER - MARIETTA', address: '1901 Terrell Mill Rd. SE', city: 'Marietta', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 227, name: 'GUITAR CENTER - MAYFIELD', address: '5800 Mayfield Rd.', city: 'Mayfield Heights', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 228, name: 'GUITAR CENTER - MCALLEN', address: '3300 W. Expressway 83, Suite 800', city: 'McAllen', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 229, name: 'GUITAR CENTER - MEDFORD', address: '2570 Crater Lake Hwy', city: 'Medford', state: 'OR', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 230, name: 'GUITAR CENTER - MEMPHIS', address: '8000 US Highway 64', city: 'Bartlett', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 231, name: 'GUITAR CENTER - MESA', address: '1652 S. Val Vista Dr., Dana Park Village Sq. Suite 118', city: 'Mesa', state: 'AZ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 232, name: 'GUITAR CENTER - MESQUITE TX', address: '2021 N. Town East', city: 'Mesquite', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 233, name: 'GUITAR CENTER - MIDLOTHIAN', address: '13357 Rittenhouse Dr.', city: 'Midlothian', state: 'VA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 234, name: 'GUITAR CENTER - MILLBURY', address: '70 Worcester Providence TPKE, Suite 410', city: 'Millbury', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 235, name: 'GUITAR CENTER - MOBILE', address: '3725 Airport Blvd., Suite J', city: 'Mobile', state: 'AL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 236, name: 'GUITAR CENTER - MODESTO', address: '3440 McHenry Ave. Suite D.20', city: 'Modesto', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 237, name: 'GUITAR CENTER - MONROEVILLE', address: '384 Mall Blvd', city: 'Monroeville', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 238, name: 'GUITAR CENTER - MONTGOMERY', address: '2572 Eastern Blvd', city: 'Montgomery', state: 'AL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 239, name: 'GUITAR CENTER - MURRIETA', address: '24370 Village Walk', city: 'Murrieta', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 240, name: 'GUITAR CENTER - NAPERVILLE', address: '996 N. Route 59', city: 'Aurora', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 241, name: 'GUITAR CENTER - NASHUA', address: '258 Daniel Webster Hwy., Suite 4', city: 'Nashua', state: 'NH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 242, name: 'GUITAR CENTER - NASHVILLE', address: '721 Thompson Lane', city: 'Nashville', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 243, name: 'GUITAR CENTER - NATICK', address: '321.C Speen St.', city: 'Natick', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 244, name: 'GUITAR CENTER - NEW LONDON', address: '351 N Frontage Rd. Space F-3', city: 'New London', state: 'CT', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 245, name: 'GUITAR CENTER - NEW ORLEANS', address: '1000 S. Clearview Parkway, Suite 1040', city: 'Harahan', state: 'LA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 246, name: 'GUITAR CENTER - NORTH ATTLEBORO', address: '1505 S. Washington St.', city: 'North Attleboro', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 247, name: 'GUITAR CENTER - NORTH CHARLOTTE', address: '8813 J.W. Clay Blvd., Suite A', city: 'Charlotte', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 248, name: 'GUITAR CENTER - NORTH CHICAGO', address: '2375 S. Arlington Heights Rd.', city: 'Arlington Heights', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 249, name: 'GUITAR CENTER - NORTH FAYETTEVILLE', address: '160 E. Joyce Blvd', city: 'Fayetteville', state: 'AR', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 250, name: 'GUITAR CENTER - NORTH HOUSTON', address: '16745 N. Freeway', city: 'Houston', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 251, name: 'GUITAR CENTER - NORTH OLMSTEAD', address: '26635 Brookpark Road Extension', city: 'North Olmsted', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 252, name: 'GUITAR CENTER - NORTH PARAMUS', address: '762 Route 17 North', city: 'Paramus', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 253, name: 'GUITAR CENTER - NORTH PORTLAND', address: '1147 Hayden Meadows Dr.', city: 'Portland', state: 'OR', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 254, name: 'GUITAR CENTER - NORTHRIDGE', address: '19510 Nordhoff St.', city: 'Northridge', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 255, name: 'GUITAR CENTER - OAKDALE', address: '8316 Third St', city: 'Oakdale', state: 'MN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 256, name: 'GUITAR CENTER - OCALA', address: '3920 SW 42nd St., Space B-2', city: 'Ocala', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 257, name: 'GUITAR CENTER - OCEAN', address: '2323 State Route 66', city: 'Ocean', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 258, name: 'GUITAR CENTER - OGDEN', address: '5430 S. Freeway Park Drive', city: 'Riverdale', state: 'UT', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 259, name: 'GUITAR CENTER - OKLAHOMA CITY', address: '2940 NW 59th Street', city: 'Oklahoma City', state: 'OK', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 260, name: 'GUITAR CENTER - OMAHA', address: '3115 Oak View Drive', city: 'Omaha', state: 'NE', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 261, name: 'GUITAR CENTER - ORANGE', address: '50 Boston Post Road', city: 'Orange', state: 'CT', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 262, name: 'GUITAR CENTER - ORANGE PARK', address: '6000 Lake Gray Blvd. #45', city: 'Jacksonville', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 263, name: 'GUITAR CENTER - ORLANDO', address: '12402 S. Orange Blossom Trail, Suite 1', city: 'Orlando', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 264, name: 'GUITAR CENTER - OVERLAND PARK', address: '6700 W. 119th St.', city: 'Overland Park', state: 'KS', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 265, name: 'GUITAR CENTER - OXFORD VALLEY', address: '2335 E. Lincoln Hwy.', city: 'Langhorne', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 266, name: 'GUITAR CENTER - OXNARD', address: '1741 E. Ventura Blvd. Suite E', city: 'Oxnard', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 267, name: 'GUITAR CENTER - PALM DESERT', address: '72-399 California Highway 111', city: 'Palm Desert', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 268, name: 'GUITAR CENTER - PALMDALE', address: '1011 West Avenue P', city: 'Palmdale', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 269, name: 'GUITAR CENTER - PARAMUS', address: '154 West State Route 4', city: 'Paramus', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 270, name: 'GUITAR CENTER - PASADENA', address: '2660 East Colorado Blvd.', city: 'Pasadena', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 271, name: 'GUITAR CENTER - PASADENA TX', address: '5140 Fairmont Pkwy', city: 'Pasadena', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 272, name: 'GUITAR CENTER - PENSACOLA', address: '6927 N. 9th Ave.', city: 'Pensacola', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 273, name: 'GUITAR CENTER - PEORIA', address: '2601 W. Lake Ave.', city: 'Peoria', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 274, name: 'GUITAR CENTER - PHOENIX', address: '2750 West Peoria Ave.', city: 'Phoenix', state: 'AZ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 275, name: 'GUITAR CENTER - PICO & WESTWOOD', address: '10831 West Pico Blvd.', city: 'Los Angeles', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 276, name: 'GUITAR CENTER - PITTSBURGH', address: '1020 Manor Park Blvd', city: 'Pittsburgh', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 277, name: 'GUITAR CENTER - PLANO', address: '2333 North Central Expressway Suite 101', city: 'Plano', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 278, name: 'GUITAR CENTER - PLYMOUTH MEETING', address: '2620 Chemical Rd', city: 'Plymouth Meeting', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 279, name: 'GUITAR CENTER - PORT ST. LUCIE FL', address: '1707 St Lucie W Blvd #142', city: 'Port St. Lucie', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 280, name: 'GUITAR CENTER - PORTLAND', address: '198 Maine Mall Rd.', city: 'Portland', state: 'ME', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 281, name: 'GUITAR CENTER - PORTSMOUTH', address: '1600 Woodbury Ave.', city: 'Portsmouth', state: 'NH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 282, name: 'GUITAR CENTER - PUEBLO', address: '5759 N. Elizabeth St.', city: 'Pueblo', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 283, name: 'GUITAR CENTER - QUEENS', address: '34-17 48th Street', city: 'Long Island City', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 284, name: 'GUITAR CENTER - RALEIGH', address: '3100 Capitol Blvd.', city: 'Raleigh', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 285, name: 'GUITAR CENTER - RANCHO CUCAMONGA', address: '12479 Foothill Blvd., Suite G/H', city: 'Rancho Cucamonga', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 286, name: 'GUITAR CENTER - RENO', address: '6663 S. Virginia St.', city: 'Reno', state: 'NV', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 287, name: 'GUITAR CENTER - RICHMOND', address: '9128 W. Broad Street', city: 'Richmond', state: 'VA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 288, name: 'GUITAR CENTER - RIDGE HILL', address: '214 Market Street', city: 'Yonkers', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 289, name: 'GUITAR CENTER - ROCHESTER', address: '1100 Jefferson Road', city: 'Rochester', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 290, name: 'GUITAR CENTER - ROCKFORD', address: '5425 E. State St', city: 'Rockford', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 291, name: 'GUITAR CENTER - ROCKVILLE', address: '12401 Twinbrook Parkway', city: 'Rockville', state: 'MD', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 292, name: 'GUITAR CENTER - ROSEVILLE', address: '5781 "B" Five Star Dr.', city: 'Roseville', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 293, name: 'GUITAR CENTER - ROUND ROCK', address: '2200 South IH-35, Suite B4', city: 'Round Rock', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 294, name: 'GUITAR CENTER - SACRAMENTO', address: '2120 Alta Arden Expressway', city: 'Sacramento', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 295, name: 'GUITAR CENTER - SAGINAW', address: '4360 Bay Road', city: 'Saginaw', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 296, name: 'GUITAR CENTER - SALEM-KEIZER', address: '6325 Ulali Drive NE', city: 'Keizer', state: 'OR', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 297, name: 'GUITAR CENTER - SALT LAKE CITY', address: '5752 S. Redwood Rd.', city: 'Taylorsville', state: 'UT', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 298, name: 'GUITAR CENTER - SAN ANTONIO', address: '7325 San Pedro Ave, Suite 105', city: 'San Antonio', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 299, name: 'GUITAR CENTER - SAN BERNARDINO', address: '925 E. Hospitality Lane', city: 'San Bernardino', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 300, name: 'GUITAR CENTER - SAN FRANCISCO', address: '1645 Van Ness Ave.', city: 'San Francisco', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 301, name: 'GUITAR CENTER - SAN JOSE', address: '3677 Stevens Creek Blvd.', city: 'San Jose', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 302, name: 'GUITAR CENTER - SAN MARCOS', address: '712 Center Dr.', city: 'San Marcos', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 303, name: 'GUITAR CENTER - SAN MATEO', address: '53 West Hillsdale Blvd', city: 'San Mateo', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 304, name: 'GUITAR CENTER - SARASOTA', address: '8223 Cooper Creek Blvd', city: 'University Park', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 305, name: 'GUITAR CENTER - SCOTTSDALE', address: '8949 East Indian Bend Road', city: 'Scottsdale', state: 'AZ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 306, name: 'GUITAR CENTER - SCRANTON', address: '3001 Shoppes Blvd. Bldg. #3000', city: 'Moosic', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 307, name: 'GUITAR CENTER - SEATTLE', address: '530 Westlake Ave.', city: 'Seattle', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 308, name: 'GUITAR CENTER - SEVEN CORNERS', address: '6272 Arlington Blvd.', city: 'Falls Church', state: 'VA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 309, name: 'GUITAR CENTER - SHERMAN OAKS', address: '14209 Ventura Blvd.', city: 'Sherman Oaks', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 310, name: 'GUITAR CENTER - SHREVEPORT', address: '7460 Youree Dr. Suite T', city: 'Shreveport', state: 'LA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 311, name: 'GUITAR CENTER - SIOUX FALLS', address: '3709 W. 41st St.', city: 'Sioux Falls', state: 'SD', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 312, name: 'GUITAR CENTER - SOMERVILLE CIRCLE', address: '401 State Rd. 28', city: 'Raritan', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 313, name: 'GUITAR CENTER - SOUTH AUSTIN', address: '5300 S. MoPac Expressway, Suite 103', city: 'Austin', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 314, name: 'GUITAR CENTER - SOUTH BAY', address: '4525 Artesia Blvd.', city: 'Lawndale', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 315, name: 'GUITAR CENTER - SOUTH BEND', address: '5825 Grape Road', city: 'Mishawaka', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 316, name: 'GUITAR CENTER - SOUTH CHICAGO', address: '7250 S. Cicero Ave. Suite C', city: 'Burbank', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 317, name: 'GUITAR CENTER - SOUTH MIAMI', address: '7736 N. Kendall Dr.', city: 'Miami', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 318, name: 'GUITAR CENTER - SOUTH SPRINGFIELD', address: '3500 S. Glenstone Ave', city: 'Springfield', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 319, name: 'GUITAR CENTER - SOUTHCENTER', address: '230 Andover Park W.', city: 'Tukwila', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 320, name: 'GUITAR CENTER - SOUTHFIELD', address: '29555 Northwestern Hwy.', city: 'Southfield', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 321, name: 'GUITAR CENTER - SOUTHINGTON CT', address: '839 Queen St', city: 'Southington', state: 'CT', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 322, name: 'GUITAR CENTER - SPOKANE', address: '5628 N. Division Street Suite B3', city: 'Spokane', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 323, name: 'GUITAR CENTER - SPRINGFIELD', address: '160 Route 22', city: 'Springfield', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 324, name: 'GUITAR CENTER - STEVENSON RANCH', address: '24961 Pico Canyon Road', city: 'Stevenson Ranch', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 325, name: 'GUITAR CENTER - SUGAR LAND', address: '12790 Fountain Lake Circle', city: 'Stafford', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 326, name: 'GUITAR CENTER - SUMMERLIN', address: '8621 Charleston Blvd., Suite 110', city: 'Las Vegas', state: 'NV', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 327, name: 'GUITAR CENTER - SYRACUSE', address: '3150 Erie Blvd.', city: 'East DeWitt', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 328, name: 'GUITAR CENTER - TACOMA', address: '2919 South 38th Street, Suite A', city: 'Tacoma', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 329, name: 'GUITAR CENTER - TALLAHASSEE', address: '2415 N. Monroe St., Suite 600', city: 'Tallahassee', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 330, name: 'GUITAR CENTER - TAMPA', address: '3914 West Hillsborough Avenue', city: 'Tampa', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 331, name: 'GUITAR CENTER - TEMPE', address: '1245 W. Elliot Rd. Suite 115', city: 'Tempe', state: 'AZ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 332, name: 'GUITAR CENTER - TERRE HAUTE', address: '3684 S. US Hwy 41', city: 'Terre Haute', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 333, name: 'GUITAR CENTER - TIMES SQUARE', address: '218 West 44th St.', city: 'New York', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 334, name: 'GUITAR CENTER - TOLEDO', address: '1578 Spring Meadows Drive', city: 'Holland', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 335, name: 'GUITAR CENTER - TOTOWA', address: '1 Route 46 West', city: 'Totowa', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 336, name: 'GUITAR CENTER - TOWSON', address: '1524 E. Joppa Rd.', city: 'Towson', state: 'MD', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 337, name: 'GUITAR CENTER - TUCSON', address: '4720 E. Broadway Blvd.', city: 'Tucson', state: 'AZ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 338, name: 'GUITAR CENTER - TULSA', address: '9919 E. 71st St.', city: 'Tulsa', state: 'OK', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 339, name: 'GUITAR CENTER - TWIN CITIES', address: '1641 County Road B2 W', city: 'Roseville', state: 'MN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 340, name: 'GUITAR CENTER - UNION SQUARE', address: '25 W. 14th Street', city: 'Manhattan', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 341, name: 'GUITAR CENTER - VILLA PARK', address: '298 W. Roosevelt Rd.', city: 'Villa Park', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 342, name: 'GUITAR CENTER - VIRGINIA BEACH', address: '5483 Virginia Beach Blvd.', city: 'Virginia Beach', state: 'VA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 343, name: 'GUITAR CENTER - VISALIA', address: '4254 S. Mooney', city: 'Visalia', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 344, name: 'GUITAR CENTER - WACO', address: '4314 W. Waco Dr.', city: 'Waco', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 345, name: 'GUITAR CENTER - WARWICK', address: '1245 Bald Hill Road', city: 'Warwick', state: 'RI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 346, name: 'GUITAR CENTER - WEST PALM BEACH', address: '5025 Okeechobee Boulevard', city: 'West Palm Beach', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 347, name: 'GUITAR CENTER - WICHITA', address: '4448 W. Kellogg Dr.', city: 'Wichita', state: 'KS', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 348, name: 'GUITAR CENTER - WILLISTON', address: '21A Hawthorne St.', city: 'Williston', state: 'VT', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 349, name: 'GUITAR CENTER - WILMINGTON', address: '5141 Brandywine Parkway', city: 'Wilmington', state: 'DE', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 350, name: 'GUITAR CENTER - WINTER PARK', address: '520 N. Orlando Ave. Suite 130', city: 'Winter Park', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 351, name: 'GUITAR CENTER - YOUNGSTOWN', address: '7380 Market St.', city: 'Boardman', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 352, name: 'Gulfport Percussion Theater', address: '2208 GREGORY BLVD', city: 'GULFPORT', state: 'MS', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 353, name: 'H & H Music', address: 'PO Box 2187', city: 'Evansville', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 354, name: 'H & H Music Service', address: '1313 WASHINGTON AVE', city: 'Evansville', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 355, name: 'Haggerty\'s Inc', address: '2520 W Main St', city: 'Rapid City', state: 'SD', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 356, name: 'Haight Ashbury Music Center', address: '1540 Haight St', city: 'San Francisco', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 357, name: 'Health Products Emporium', address: '1759 Oceanside Blvd. Suite D', city: 'Oceanside', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 358, name: 'Heaney Violins', address: '1350 Grant Road', city: 'Mountain View', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 359, name: 'Hear Say Hearing Center Inc.', address: '131 N Church St.', city: 'Westchester', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 360, name: 'Hearing Aid Consultants', address: '315 Ellis Blvd. Suite 202', city: 'Jefferson City', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 361, name: 'Hearing Aids Today', address: '1120 Park Ave', city: 'Orange Park', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 362, name: 'Hearing Connections Audiology, LLC', address: '2072 STUBBS MILL RD', city: 'Lebanon', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 363, name: 'Hearing Rehabilitation Center', address: '2900 Union Lake Rd., Ste 100', city: 'Commerce', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 364, name: 'Hearing Solutions of the Gulf Coast', address: '312 Sun City Center Blvd', city: 'Sun City Center', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 365, name: 'HERKIMER HEARING CENTER', address: '200 Prospect St., Ste.101', city: 'Herkimer', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 366, name: 'Hersey Eyecare', address: '14 Parsonage St', city: 'Winterport', state: 'ME', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 367, name: 'Hinton Community School District', address: '315 W. Grand Street', city: 'Hinton', state: 'IA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 368, name: 'Hoggtowne Music Inc', address: '2441 NW 43rd St', city: 'Gainesville', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 369, name: 'House Of Hearing Audiology', address: '5513 Glenwood Street #B', city: 'Boise', state: 'ID', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 370, name: 'Instrumental Music Center', address: '7063 E Speedway', city: 'Tucson', state: 'AZ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 371, name: 'Intelacoustics I.K.E.', address: '4 Pireos Street', city: 'Athens', state: '', country: 'Greece', countryCode: 'GR', website: '', badge: null },
  { id: 372, name: 'IRC Music', address: '5911 East 82nd Street', city: 'Indianapolis', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 373, name: 'J Sharp Music', address: '428 Main St NW', city: 'Los Lunas', state: 'NM', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 374, name: 'J.W. Pepper & Son, Inc.', address: '2480 Industrial Blvd.', city: 'Paoli', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 375, name: 'JACKSONS MUSIC STORE', address: '7445-A OLD NATIONAL HWY', city: 'RIVERDALE', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 376, name: 'Janus Development Group', address: '308 W Arlington Blvd, Ste 300', city: 'Greenville', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 377, name: 'Jimmy\'s Music & Supply', address: '1480 E 2nd Ave', city: 'Durango', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 378, name: 'Kellards/Tie Photo Inc', address: '365 Marcy Ave', city: 'Brooklyn', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 379, name: 'Kendall Audiology & HAC', address: '9150 SW 87th AVE', city: 'Miami', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 380, name: 'Kennelly Keys Music', address: '4918 196th St SW', city: 'Lynnwood', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 381, name: 'KYR Music LLC', address: '14560 Pipeline Ave', city: 'Chino', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 382, name: 'Lafayette Music', address: '3700 Johnston Street', city: 'Lafayette', state: 'LA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 383, name: 'LAKE CHARLES MUSIC', address: '1000 E. PRIEN LAKE RD', city: 'LAKE CHARLES', state: 'LA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 384, name: 'Langlois Music Co Inc', address: '1700 McHenry Ave Ste 78', city: 'Modesto', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 385, name: 'LAUDIO Audiologia', address: 'Dr. Delgado No. 7', city: 'Santo Domingo', state: '', country: 'Dominican Republic', countryCode: 'DO', website: '', badge: null },
  { id: 386, name: 'Lauzon Music Center Ltd', address: '1345 Wellington St West', city: 'Ottawa', state: 'ON', country: 'Canada', countryCode: 'CA', website: '', badge: null },
  { id: 387, name: 'Lone Star Percussion', address: '10611 Control Place', city: 'Dallas', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 388, name: 'Madison Band Supply', address: '1604-B Hughes Road', city: 'Madison', state: 'AL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 389, name: 'MARCHMASTER', address: 'PO Box 73379', city: 'Newnan', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 390, name: 'Marshall Music Co.', address: '3240 East Saginaw', city: 'Lansing', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 391, name: 'Martin Music', address: '1659 Poplar Ave', city: 'Memphis', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 392, name: 'Massey Drugs', address: '3501 Cloverdale Rd', city: 'Florence', state: 'AL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 393, name: 'MAYDE CREEK H.S. Band', address: '19202 Groeschke Road', city: 'Houston', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 394, name: 'McCracken County Bands', address: '6530 New Highway 60', city: 'West Paducah', state: 'KY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 395, name: 'McMaster-Carr', address: 'PO Box 5516', city: 'Chicago', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 396, name: 'Merle\'s Music', address: '304 N Bishop Ave', city: 'Rolla', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 397, name: 'Milano Music Center', address: '38 W Main St', city: 'Mesa', state: 'AZ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 398, name: 'Miller Marketing Co, Inc.', address: '401 West Elm Street', city: 'Norristown', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 399, name: 'Mobile Hearing Specialists', address: '202 Tarpon Point', city: 'Tarpon Springs', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 400, name: 'Mothertone', address: 'Soundcheck', city: 'Nashville', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 401, name: 'Mr. Music Inc.', address: '128 Harvard Ave.', city: 'Allston', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 402, name: 'Msp Musique Inc.', address: '140 - 9 Route du Pont', city: 'Saint Nicolas', state: 'QC', country: 'Canada', countryCode: 'CA', website: '', badge: null },
  { id: 403, name: 'Music Go Round', address: '7116 Menaul Blvd. NE', city: 'Albuquerque', state: 'NM', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 404, name: 'Music Go Round', address: '833 Bethel Road', city: 'Columbus', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 405, name: 'Music Go Round', address: '8055 W Bowles Ave #2C', city: 'Littleton', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 406, name: 'Music In Motion', address: '1601 E. Plano Pkwy, Ste 100', city: 'Plano', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 407, name: 'Music Mart', address: '122 S Solana Hills Dr', city: 'Solana Beach', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 408, name: 'Music Masters', address: '1114 N Monroe St', city: 'Tallahassee', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 409, name: 'Music Village', address: '2971 Union Ave', city: 'San Jose', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 410, name: 'N.E.C.', address: '290 Huntington Ave', city: 'Boston', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 411, name: 'Nashville Dental Inc.', address: '1229 Northgate Business Pkway', city: 'Madison', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 412, name: 'Naval Submarine Medical Research Lab', address: 'Box 900', city: 'Groton', state: 'CT', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 413, name: 'Olde Mill Music & Sound', address: '236 N. Main Street', city: 'Mount Airy', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 414, name: 'Open Chord', address: '2216 Southern Shades Blvd.', city: 'Knoxville', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 415, name: 'Orlando Hearing Center', address: '430 SR 436 #104', city: 'Casselberry', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 416, name: 'Pasadena Hearing Care', address: '1609 Pasadena Ave. S', city: 'South Pasadena', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 417, name: 'Pearson Dental', address: '13161 Telfair Ave.', city: 'Sylmar', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 418, name: 'PERSONAL SOUND HEARING AID CENTER', address: '6652 W. ARCHER AVENUE', city: 'Chicago', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 419, name: 'Pitbull Audio', address: '300 W. 28th Street #101', city: 'National City', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 420, name: 'Pladd Dot Music', address: '38 North Main Street', city: 'Statesboro', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 421, name: 'Portmans Music Superstore Inc', address: '7650 Abercorn Street', city: 'Savannah', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 422, name: 'Potter Violins', address: '7711 Eastern Ave', city: 'Takoma Park', state: 'MD', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 423, name: 'Prest. Serv. Prof. & Venta Audifonos Clinfocs', address: 'Provincia de Santa Elena', city: 'Santa Elena', state: '', country: 'Ecuador', countryCode: 'EC', website: '', badge: null },
  { id: 424, name: 'Pro Sound Music Center', address: '8511 Skyland Dr', city: 'Longmont', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 425, name: 'Provo Music Center', address: '1006 South State St', city: 'Orem', state: 'UT', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 426, name: 'Rainbow Music', address: '1148 Leonard NW', city: 'Grand Rapids', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 427, name: 'Resurrection Drums', address: '1323 S. 30th Avenue', city: 'Hollywood', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 428, name: 'Retailwide Ltd', address: 'Unit 16 Riverside Ind. Park', city: 'Ipswich', state: 'Suffolk', country: 'United Kingdom', countryCode: 'GB', website: '', badge: null },
  { id: 429, name: 'Rock Solid Gear', address: '182 Rawls Springs Loop Rd, Ste 20', city: 'Hattiesburg', state: 'MS', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 430, name: 'Rock U. Studios, Inc.', address: '5700 Concord Parkway S', city: 'Concord', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 431, name: 'Rush\'s Musical Services Inc', address: '2107 Chapman Hwy', city: 'Knoxville', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 432, name: 'RUSSO MUSIC', address: '1989 ARENA DRIVE #3', city: 'Hamilton Township', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 433, name: 'Safe On Sound', address: 'C/ Algemesi 2', city: 'Balearic Islands', state: '', country: 'Spain', countryCode: 'ES', website: '', badge: null },
  { id: 434, name: 'School of Rock Annapolis', address: '1460 Ritchie Highway', city: 'Arnold', state: 'MD', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 435, name: 'School of Rock Arlington Heights', address: '17 E. Campbell Street', city: 'Arlington Heights', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 436, name: 'School of Rock Atlanta', address: '2989 N. Fulton Drive NE', city: 'Atlanta', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 437, name: 'School of Rock Austin', address: '2525 W Anderson Lane #138', city: 'Austin', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 438, name: 'School of Rock Baltimore', address: '3600 Clipper Mill Road #115', city: 'Baltimore', state: 'MD', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 439, name: 'School of Rock Bellevue', address: '14330 NE 20th Street', city: 'Bellevue', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 440, name: 'School of Rock Boca Raton', address: '141 NW 20th Street', city: 'Boca Raton', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 441, name: 'School of Rock Broomfield', address: '11970 Quay Street', city: 'Broomfield', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 442, name: 'School of Rock Calgary', address: '95 WestRidge Crescent SW', city: 'Calgary', state: 'Alberta', country: 'Canada', countryCode: 'CA', website: '', badge: null },
  { id: 443, name: 'School of Rock Canton', address: '5810 N. Sheldon Road', city: 'Canton', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 444, name: 'School of Rock Carmel', address: '626 S. Rangeline Road', city: 'Carmel', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 445, name: 'School of Rock Chapel Hill', address: '1181 Great Ridge Pkway', city: 'Chapel Hill', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 446, name: 'School of Rock Charlotte', address: '1105 Greenwood Cliff', city: 'Charlotte', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 447, name: 'School of Rock Cherry Hill', address: '1990 Route 70 East', city: 'Cherry Hill', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 448, name: 'School of Rock Chesapeake', address: '1032 Volvo Pkway', city: 'Chesapeake', state: 'VA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 449, name: 'School of Rock Chicago', address: '3254 N. Lincoln Ave Unit B', city: 'Chicago', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 450, name: 'School of Rock Chicago West', address: '1913 W. Chicago Ave', city: 'Chicago', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 451, name: 'School of Rock Cincinnati', address: '6710 Madison Road', city: 'Cincinnati', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 452, name: 'School of Rock Clear Lake', address: '1020 W. Nasa Parkway', city: 'Webster', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 453, name: 'School of Rock Columbia', address: '6935 Oakland Mills Road #N', city: 'Columbia', state: 'MD', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 454, name: 'School Of Rock Corp.', address: '1 Wattles Street', city: 'Canton', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 455, name: 'School of Rock Cresskill', address: '50 Piermont Road', city: 'Cresskill', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 456, name: 'School of Rock Doylestown', address: '135 South Main Street', city: 'Doylestown', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 457, name: 'School of Rock Dublin', address: '6727 Dublin Center Drive', city: 'Dublin', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 458, name: 'School of Rock East Brunswick', address: '3 Lexington Ave', city: 'East Brunswick', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 459, name: 'School of Rock East Cobb', address: '2469 East Piedmont Road', city: 'Marietta', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 460, name: 'School of Rock East Lansing', address: '2037 West Grand River Ave', city: 'Okemos', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 461, name: 'School of Rock Edmond', address: '100 N. Broadway', city: 'Edmond', state: 'OK', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 462, name: 'School of Rock Elk Grove', address: '9045 Elk Grove Blvd', city: 'Elk Grove', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 463, name: 'School of Rock Fairfax District LA', address: '7801 Beverly Blvd', city: 'Los Angeles', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 464, name: 'School of Rock Farmington', address: '22730 Orchard Lake Road', city: 'Farmington', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 465, name: 'School of Rock Fayetteville', address: '2857 N. College', city: 'Fayetteville', state: 'AR', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 466, name: 'School of Rock Fishers', address: '11740 Olio Road #100', city: 'Fishers', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 467, name: 'School of Rock Fort Collins', address: '215 E. Foothills Pkway', city: 'Fort Collins', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 468, name: 'School of Rock Fort Myers', address: '7661 KNIGHTWING CIRCLE', city: 'Fort Myers', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 469, name: 'School of Rock Fort Washington', address: '425A Delaware Drive', city: 'Fort Washington', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 470, name: 'School of Rock Fort Wayne', address: '9006 Coldwater Road', city: 'Fort Wayne', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 471, name: 'School of Rock Franklin', address: '615 Bakers Bridge Ave', city: 'Franklin', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 472, name: 'School of Rock Frisco', address: '6891 Main Street', city: 'Frisco', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 473, name: 'School of Rock Gahanna', address: '3965 Davidson Run Court', city: 'Hilliard', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 474, name: 'School of Rock Gambrills', address: '1041 Route 3 North Suite 10', city: 'Gambrills', state: 'MD', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 475, name: 'School of Rock Germantown', address: '9309 Poplar Ave #102', city: 'Germantown', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 476, name: 'School of Rock Gilbert', address: '885 E. Warner Road', city: 'Gilbert', state: 'AZ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 477, name: 'School of Rock Glen Ellyn', address: '536B Crescent Blvd #536B', city: 'Glen Ellyn', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 478, name: 'School of Rock Glenbrook', address: '3139 Dundee Road', city: 'Northbrook', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 479, name: 'School of Rock Highland Heights', address: '299 Alpha Park', city: 'Highland Heights', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 480, name: 'School of Rock Hinsdale, LLC', address: '116 South Washington Street', city: 'Hinsdale', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 481, name: 'School of Rock Hoboken', address: '797 Springfield Ave #3', city: 'Summit', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 482, name: 'School of Rock Issaquah', address: '1640 NW Gilman Blvd #1', city: 'Issaquah', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 483, name: 'School of Rock Johns Creek', address: '10900 Medlock Bridge Road', city: 'Johns Creek', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 484, name: 'School of Rock Katy', address: '3750 S Mason Road #800', city: 'Katy', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 485, name: 'School of Rock Kingwood', address: '1580 Kingwood Drive', city: 'Kingwood', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 486, name: 'School of Rock Kirkwood', address: '104 N. Kirkwood Road', city: 'Kirkwood', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 487, name: 'School of Rock Knoxville', address: '101 Sherlock Lane', city: 'Knoxville', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 488, name: 'School of Rock Las Vegas West', address: '9340 W. Flamingo Road', city: 'Las Vegas', state: 'NV', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 489, name: 'School of Rock Lee\'s Summit', address: '1121 NE RICE Road', city: 'Lee\'s Summit', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 490, name: 'School of Rock Libertyville', address: '700 WINDSOR ROAD', city: 'GLENVIEW', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 491, name: 'School Of Rock Littleton', address: '5950 South Platte Canyon Road', city: 'Littleton', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 492, name: 'School of Rock Lubbock', address: '3325 North FM 2378', city: 'Shallowater', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 493, name: 'School of Rock Main Line', address: '511 Old Lancaster Road', city: 'Berwyn', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 494, name: 'School of Rock Memorial', address: '1415 SOUTH VOSS ROAD', city: 'Houston', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 495, name: 'School of Rock Memphis', address: '400 Perkins Extd', city: 'Memphis', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 496, name: 'School of Rock Metairie / New Orleans', address: '1907 Veterans Blvd', city: 'Metairie', state: 'LA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 497, name: 'School of Rock Miami', address: '8783 SW 132nd STREET', city: 'Miami', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 498, name: 'School of Rock Midlothian', address: '13154 Midlothian Turnpike', city: 'Midlothian', state: 'VA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 499, name: 'School of Rock Montclair', address: '125 Valley Road', city: 'Montclair', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 500, name: 'School of Rock Naperville', address: '220 N Washington Street', city: 'Naperville', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 501, name: 'School of Rock Nashville', address: '3201 Belmont Blvd', city: 'Nashville', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 502, name: 'School of Rock Natick', address: '217 West Central Street', city: 'Natick', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 503, name: 'School of Rock New Braunfels', address: '940 W San Antonio Street', city: 'New Braunfels', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 504, name: 'School of Rock North Miami', address: '2000 NE 146 Street', city: 'North Miami', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 505, name: 'School of Rock Oak Park', address: '130 SOUTH ELMWOOD AVE', city: 'Oak Park', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 506, name: 'School of Rock Oceanside', address: '4095 Oceanside Blvd', city: 'Oceanside', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 507, name: 'School of Rock Omaha', address: '13270 Millard Ave', city: 'Omaha', state: 'NE', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 508, name: 'School of Rock Orangeburg', address: '135 East Erie Street', city: 'Blauvelt', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 509, name: 'School of Rock Orlando', address: '6700 Conroy Windermere Road', city: 'Orlando', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 510, name: 'School of Rock Otay Ranch', address: '2015 Birch Road', city: 'Chula Vista', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 511, name: 'School of Rock Overland Park', address: '9296 Metcalf Ave', city: 'Overland Park', state: 'KS', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 512, name: 'School of Rock Palo Alto', address: '2645 Middlefield Road', city: 'Palo Alto', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 513, name: 'School of Rock Park Ridge', address: '15 N Prospect Ave', city: 'Park Ridge', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 514, name: 'School of Rock Parkville / KS City', address: '1315 East Street', city: 'Parkville', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 515, name: 'School of Rock Pearland', address: '3422 Business Center Drive', city: 'Pearland', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 516, name: 'School of Rock Plano', address: '1501 Preston Road #550', city: 'Plano', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 517, name: 'School of Rock Rancho Santa Margarita', address: '30092 Santa Margarita Pkway', city: 'Rancho Santa Margarita', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 518, name: 'School of Rock Red Bank', address: '52 Monmouth Street', city: 'Red Bank', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 519, name: 'School of Rock Regina', address: '515 McDonald Street', city: 'Regina', state: 'SK', country: 'Canada', countryCode: 'CA', website: '', badge: null },
  { id: 520, name: 'School of Rock Rochester', address: '415 Walnut Blvd', city: 'Rochester', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 521, name: 'School of Rock Roseville', address: '228 Vernon Street', city: 'Roseville', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 522, name: 'School of Rock Round Rock', address: '4500 E. Palm Valley Blvd.', city: 'Round Rock', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 523, name: 'School of Rock San Jose', address: '5035 Almaden', city: 'San Jose', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 524, name: 'School of Rock Santa Rosa', address: '1462 Mendocino Ave', city: 'Santa Rosa', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 525, name: 'School of Rock Scripps Ranch', address: '1753 Caudor Street', city: 'Encinitas', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 526, name: 'School of Rock Seattle', address: '106 N. 85th Street', city: 'Seattle', state: 'WA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 527, name: 'School of Rock Short Pump', address: '4300 Pouncey Tract Road', city: 'Glen Allen', state: 'VA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 528, name: 'School of Rock Southlake / Keller', address: '3220 W. SOUTHLAKE BLVD', city: 'Southlake', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 529, name: 'School of Rock Spring', address: '21117 North Freeway', city: 'Spring', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 530, name: 'School of Rock Springfield', address: '1658 E. Sunshine Street', city: 'Springfield', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 531, name: 'School of Rock Sugar Land', address: '1935 Lakeside Plaza Drive', city: 'Sugar Land', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 532, name: 'School of Rock SW Austin', address: '9600 I-35, Suite I-100', city: 'Austin', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 533, name: 'School of Rock Temecula', address: '30630 Rancho California Rd', city: 'Temecula', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 534, name: 'School of Rock The Woodlands', address: '30420 FM 2978', city: 'The Woodlands', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 535, name: 'School of Rock Tustin', address: '530 East First Street', city: 'Tustin', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 536, name: 'School of Rock Vacaville', address: '322-B Parker St', city: 'Vacaville', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 537, name: 'School of Rock Virginia Beach', address: '1552 Mill Dam Road', city: 'Virginia Beach', state: 'VA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 538, name: 'School of Rock Wake Forest', address: '3309 Rogers Road Suite 105', city: 'Wake Forest', state: 'NC', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 539, name: 'School of Rock Wayne', address: '1055 Hamburg Turnpike #1-A', city: 'Wayne', state: 'NJ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 540, name: 'School of Rock West Cobb', address: '1600 Kennesaw Due West RD NW', city: 'Kennesaw', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 541, name: 'School of Rock West L.A.', address: '12020 WILSHIRE BLVD', city: 'Los Angeles', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 542, name: 'School of Rock West Univ Place', address: '2607 Bissonnet St', city: 'Houston', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 543, name: 'School of Rock White Plains', address: '242 Central Ave', city: 'White Plains', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 544, name: 'School of Rock Williamsburg', address: '294 Graham Ave', city: 'Brooklyn', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 545, name: 'School of Rock Woodland Hills', address: '6727 FALLBROOK AVE', city: 'WEST HILLS', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 546, name: 'Senseney Music, Inc.', address: '2300 East Lincoln', city: 'Wichita', state: 'KS', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 547, name: 'SONIC', address: '629 Nudgee Rd', city: 'Nundah', state: 'QLD', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 548, name: 'SONISORD LABORATORIO AUDIOLOGICO', address: 'Valencia, 612 Bis', city: 'Barcelona', state: '', country: 'Spain', countryCode: 'ES', website: '', badge: null },
  { id: 549, name: 'Sound Exchange', address: '2906 NE 14th Street', city: 'Ocala', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 550, name: 'Sound House Inc', address: '14-3 Shin-Izumi', city: 'Narita Chiba', state: '', country: 'Japan', countryCode: 'JP', website: '', badge: null },
  { id: 551, name: 'Sound of Music', address: '2631 W Railway Ave', city: 'Abbotsford', state: 'BC', country: 'Canada', countryCode: 'CA', website: '', badge: null },
  { id: 552, name: 'SOUND PROOF BROTHERS', address: '150/132 PHUTTHAMONTHON SAI RD', city: 'BANGKOK', state: '', country: 'Thailand', countryCode: 'TH', website: '', badge: null },
  { id: 553, name: 'South Texas Hearing Center Edinburg', address: '922 S. Closner Blvd #A', city: 'Edinburg', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 554, name: 'Spicer\'s Music, LLC', address: '2140 E University Dr', city: 'Auburn', state: 'AL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 555, name: 'Springfield Music', address: '1902 E Meadowmere', city: 'Springfield', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 556, name: 'Starsound Audio Inc', address: '2679 Oddie Blvd', city: 'Reno', state: 'NV', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 557, name: 'Steve Weiss Music', address: '2324 Wyandotte Rd', city: 'Willow Grove', state: 'PA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 558, name: 'Store DJ', address: '394 Victoria Street', city: 'Richmond', state: 'VIC', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 559, name: 'Store DJ', address: '2/108 Botany Rd', city: 'Alexandria', state: 'NSW', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 560, name: 'Store DJ', address: '161 St Georges Rd', city: 'Fitzroy North', state: 'VIC', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 561, name: 'Store DJ', address: '2/71 Brunswick St', city: 'Fortitude Valley', state: 'QLD', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 562, name: 'Store DJ', address: '2/7 Loftus St', city: 'West Leederville', state: 'WA', country: 'Australia', countryCode: 'AU', website: '', badge: null },
  { id: 563, name: 'Sun Music International LLC', address: '12555 Orange Drive', city: 'Davie', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 564, name: 'SW Ohio Home School Music Academy', address: '4041 Shaker Road', city: 'Franklin', state: 'OH', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 565, name: 'SXSW', address: 'PO Box 685289', city: 'Austin', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 566, name: 'Tempo Trend Music Ltd', address: '410 Burnside Rd East', city: 'Victoria', state: 'BC', country: 'Canada', countryCode: 'CA', website: '', badge: null },
  { id: 567, name: 'The Band House Music Store', address: '3033 Kennedy Ln.', city: 'Texarkana', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 568, name: 'The Fret Shop', address: '309 Jordan Ln', city: 'Huntsville', state: 'AL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 569, name: 'The Guitar Emporium', address: '1610 Bardstown Road', city: 'Louisville', state: 'KY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 570, name: 'The Headphone Company', address: '64 The Maltings', city: 'Hertfordshire', state: '', country: 'United Kingdom', countryCode: 'GB', website: '', badge: null },
  { id: 571, name: 'The Hearing Center', address: '818 E. Main St.', city: 'Riverhead', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 572, name: 'The Horn Doctor Music Store Inc', address: '1000 Ingra St', city: 'Anchorage', state: 'AK', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 573, name: 'The Horn Guys', address: '408 SOUTH PASADENA AVE SUITE 1', city: 'PASADENA', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 574, name: 'The Horn Section', address: '1408 HIGHLAND AVE', city: 'Melbourne', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 575, name: 'The Luthier Shoppe', address: '1717 W. Wabash Ave', city: 'Springfield', state: 'IL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 576, name: 'The Medicine Shoppe Pharmacy', address: '1230 Main St', city: 'Altavista', state: 'VA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 577, name: 'The Music Link', address: '31067 San Clemente St', city: 'Hayward', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 578, name: 'THE MUSIC SHOP, dba HARMON MUSIC', address: '5290 MAIN STREET EAST', city: 'MAPLE PLAIN', state: 'MN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 579, name: 'The Music Store', address: '2630 W Baseline Rd', city: 'Mesa', state: 'AZ', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 580, name: 'The Musician\'s Warehouse Inc', address: '245 N. Lumpkin St.', city: 'Athens', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 581, name: 'The Signal Group', address: '22285 Roethel Dr', city: 'Novi', state: 'MI', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 582, name: 'The Wayland Music Store', address: '303 N. Lackawanna Street', city: 'Wayland', state: 'NY', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 583, name: 'Thunder Creek Inc.', address: '11180 Alpharetta Highway', city: 'Roswell', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 584, name: 'Tim\'s Music', address: '6818 B Fair Oaks Blvd', city: 'Carmichael', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 585, name: 'TJ\'S MUSIC', address: '347 SO. MAIN ST', city: 'FALL RIVER', state: 'MA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 586, name: 'Todd\'s Guitars, Etc.', address: '460 Main St', city: 'Longmont', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 587, name: 'Tone Shop Guitars', address: '15317 Midway Rd', city: 'Addison', state: 'TX', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 588, name: 'U.S. Band & Orchestra Supplies, Inc', address: '1400 Ferguson Ave', city: 'St. Louis', state: 'MO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 589, name: 'UCF School of Performing Arts-Music Dept', address: '12488 Centauras Blvd', city: 'Orlando', state: 'FL', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 590, name: 'Vance Music Center Inc', address: '112 W Sixth St', city: 'Bloomington', state: 'IN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 591, name: 'VILLA NEVAREZ HEARING CENTER', address: 'VILLA NEVAREZ PROFESSIONAL CTR.', city: 'San Juan', state: '', country: 'Puerto Rico', countryCode: 'PR', website: '', badge: null },
  { id: 592, name: 'VIRADA DRUMS', address: '3014 Littleleaf Lane', city: 'Boulder', state: 'CO', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 593, name: 'Washington Music Center', address: '11151 Veirs Mill Road', city: 'Wheaton', state: 'MD', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 594, name: 'Westmoreland Band', address: '4300 Hawkins Drive', city: 'Westmoreland', state: 'TN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 595, name: 'WESTRIDGE AUDIO AB', address: 'OSTERMALMSGATAN 15', city: 'VASTERAS', state: '', country: 'Sweden', countryCode: 'SE', website: '', badge: null },
  { id: 596, name: 'White County H.S. Band', address: '2600 Hwy 129 North', city: 'Cleveland', state: 'GA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 597, name: 'WIBWABWUB', address: '1092 DUMRONGRAK ROAD', city: 'BANGKOK', state: '', country: 'Thailand', countryCode: 'TH', website: '', badge: null },
  { id: 598, name: 'Willamette Valley Music Co', address: '484 State St', city: 'Salem', state: 'OR', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 599, name: 'Willie\'s American Guitars', address: '254 Cleveland Ave. S.', city: 'St. Paul', state: 'MN', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 600, name: 'World of Stereo', address: '1080 Market St', city: 'San Francisco', state: 'CA', country: 'United States', countryCode: 'US', website: '', badge: null },
  { id: 601, name: 'Zonaudio Soluciones Auditivas', address: 'C/Salcedo, Esq. Gaspar Hernandez No. 47', city: 'Santo Domingo', state: '', country: 'Dominican Republic', countryCode: 'DO', website: '', badge: null },
];

const StoreLocator: NextPage = () => {
  const { t } = useTranslation('common');
  const [search,    setSearch]    = useState('');
  const [country,   setCountry]   = useState('All');
  const [activeId,  setActiveId]  = useState<number>(stores[0].id);

  const activeStore = stores.find(s => s.id === activeId) ?? stores[0];

  const countryTabs = [
    { value: 'All',           label: t('storeLocator.tabAll') },
    { value: 'United States', label: t('storeLocator.tabUS') },
    { value: 'Canada',        label: t('storeLocator.tabCanada') },
    { value: 'Australia',     label: t('storeLocator.tabAustralia') },
    { value: 'International', label: t('storeLocator.tabInternational') },
  ];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return stores.filter(s => {
      const matchesCountry =
        country === 'All'
          ? true
          : country === 'International'
            ? !['United States', 'Canada', 'Australia'].includes(s.country)
            : s.country === country;

      const matchesSearch =
        !q ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q);

      return matchesCountry && matchesSearch;
    });
  }, [search, country]);

  return (
    <Layout>
      <div className={styles.page}>

        {/* ── 1. Page header ─────────────────────────── */}
        <div className={styles.pageHeader}>
          <div className="container">
            <h1 className={styles.heading}>{t('storeLocator.heading')}</h1>
            <p className={styles.sub}>
              {t('storeLocator.sub')}{' '}
              <Link href="/collection" className={styles.subLink}>{t('storeLocator.subLinkText')}</Link>{' '}
              {t('storeLocator.subSuffix')}
            </p>
          </div>
        </div>

        <div className="container">

          {/* ── 2. Search bar ───────────────────────────── */}
          <div className={styles.searchRow}>
            <div className={styles.searchWrap}>
              <SearchIcon />
              <input
                type="search"
                className={styles.searchInput}
                placeholder={t('storeLocator.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label={t('storeLocator.searchLabel')}
              />
            </div>
            <button className={styles.searchBtn} onClick={() => {}}>{t('storeLocator.searchBtn')}</button>
          </div>

          {/* ── 3. Country filter tabs ───────────────────── */}
          <div className={styles.tabs}>
            {countryTabs.map(c => (
              <button
                key={c.value}
                className={`${styles.tab} ${country === c.value ? styles.tabActive : ''}`}
                onClick={() => setCountry(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* ── 4. Two-column layout ─────────────────────── */}
          <div className={styles.layout}>

            {/* Store list */}
            <div className={styles.listCol}>
              {filtered.length === 0 ? (
                <p className={styles.noResults}>{t('storeLocator.noResults')}</p>
              ) : (
                filtered.map(store => (
                  <div
                    key={store.id}
                    className={`${styles.card} ${activeId === store.id ? styles.cardActive : ''}`}
                    onClick={() => setActiveId(store.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setActiveId(store.id)}
                  >
                    <div className={styles.cardTop}>
                      <h3 className={styles.storeName}>{store.name}</h3>
                      <span className={styles.storeCountry}>
                        {countryCodeFlag(store.countryCode)} {store.country}
                      </span>
                    </div>

                    <p className={styles.storeAddr}>{store.address}, {store.city}{store.state ? ', ' + store.state : ''}</p>

                    {store.badge && (
                      <span className={styles.badge}>{t('storeLocator.officialRetailer')}</span>
                    )}

                    <div className={styles.cardActions}>
                      <a
                        href={buildDirectionsUrl(store)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btnDirections}
                        onClick={e => e.stopPropagation()}
                      >
                        {t('storeLocator.getDirections')}
                      </a>
                      {store.website && (
                        <a
                          href={store.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnWebsite}
                          onClick={e => e.stopPropagation()}
                        >
                          {t('storeLocator.website')} →
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Active store detail card (replaces iframe — Google Maps embed
                is blocked both by our CSP frame-src and by Google's
                X-Frame-Options: SAMEORIGIN on the non-API embed URL. Users
                click through to Google Maps in a new tab instead.) */}
            <div className={styles.mapCol}>
              <div className={styles.detailCard}>
                <span className={styles.detailFlag}>{countryCodeFlag(activeStore.countryCode)}</span>
                <h3 className={styles.detailName}>{activeStore.name}</h3>
                <address className={styles.detailAddress}>
                  {activeStore.address}<br />
                  {activeStore.city}{activeStore.state ? `, ${activeStore.state}` : ''}<br />
                  {activeStore.country}
                </address>
                {activeStore.badge && (
                  <span className={styles.badge}>{t('storeLocator.officialRetailer')}</span>
                )}
                <a
                  href={buildDirectionsUrl(activeStore)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.detailMapsBtn}
                >
                  {t('storeLocator.openInMaps')}
                </a>
                {activeStore.website && (
                  <a
                    href={activeStore.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.detailWebsiteBtn}
                  >
                    {t('storeLocator.website')} →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ── 5. Can't find a store? ───────────────────── */}
          <div className={styles.notFound}>
            <div className={styles.notFoundText}>
              <h2 className={styles.notFoundHeading}>{t('storeLocator.cantFindHeading')}</h2>
              <p className={styles.notFoundSub}>{t('storeLocator.cantFindSub')}</p>
            </div>
            <div className={styles.notFoundActions}>
              <Link href="/collection" className={styles.btnShop}>{t('storeLocator.shopOnline')} →</Link>
              <Link href="/contact"    className={styles.btnContact}>{t('storeLocator.contactUs')}</Link>
            </div>
          </div>

          {/* ── 6. Become a Retailer ────────────────────── */}
          <div className={styles.retailer}>
            <div className={styles.retailerInner}>
              <h2 className={styles.retailerHeading}>{t('storeLocator.retailerHeading')}</h2>
              <p className={styles.retailerSub}>{t('storeLocator.retailerSub')}</p>
              <a
                href="mailto:info@earasers.shop?subject=Retailer%20Inquiry"
                className={styles.retailerLink}
              >
                {t('storeLocator.retailerLink')} →
              </a>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

function countryCodeFlag(code: string): string {
  const flags: Record<string, string> = {
    US: '🇺🇸', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪', SE: '🇸🇪',
    KR: '🇰🇷', TW: '🇹🇼', JP: '🇯🇵', TH: '🇹🇭', GR: '🇬🇷',
    ES: '🇪🇸', GB: '🇬🇧', DO: '🇩🇴', EC: '🇪🇨', MX: '🇲🇽',
    PR: '🇵🇷', GU: '🇬🇺',
  };
  return flags[code] ?? '🌍';
}

const SearchIcon = () => (
  <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});

export default StoreLocator;
