/* eslint-disable import/prefer-default-export */
const RAW_LISTINGS = [
  {
    id: 1,
    company_name: 'luxoftusa',
    job_title: 'seniorsoftwaredeveloper/engineer',
    location: 'NewYork,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/senior-software-developer-engineer-new-york-ny-us-luxoft-usa/219781415',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 2,
    company_name: 'cybercoders',
    job_title: 'softwareengineer-awspythonjavar&dfinops',
    location: 'NewYork,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/software-engineer-aws-python-java-r-d-finops-new-york-ny-us-cybercoders/220307336',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 3,
    company_name: 'pseg',
    job_title: 'cloudengineer',
    location: 'Newark,NJ',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/cloud-engineer-newark-nj-us-pseg/219952636',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 4,
    company_name: 'fidelitytalentsource',
    job_title: 'javadeveloper',
    location: 'JerseyCity,NJ',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/java-developer-jersey-city-nj-us-fidelity-talentsource/8bcb70a9-5b5b-4200-803c-a786ca36505a',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 5,
    company_name: 'snitechnology',
    job_title: 'javadeveloperwithoraclesoa',
    location: 'NewYork,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/java-developer-with-oracle-soa-new-york-ny-us-sni-technology/220215959',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 6,
    company_name: 'opensystemstechnologies',
    job_title: 'seniorjavadeveloper',
    location: 'NewYork,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/senior-java-developer-new-york-ny-us-open-systems-technologies/220184716',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 7,
    company_name: 'companyconfidential',
    job_title: 'sr.javaengineer',
    location: 'Manhattan,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/sr-java-engineer-manhattan-ny-us/219893018',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 8,
    company_name: 'confidential',
    job_title: 'seniorleadcloudarchitect',
    location: 'Edison,NJ',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/senior-lead-cloud-architect-edison-nj-us-confidential/220169697',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 9,
    company_name: 'shulmanflemingandpartners',
    job_title: 'contract.netdeveloper',
    location: 'JerseyCity,NJ',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/contract-net-developer-jersey-city-nj-us-shulman-fleming-partners/219634619',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 10,
    company_name: 'nigelfrankinternational',
    job_title: 'cloudsolutionsarchitect-remote-$180-$220k',
    location: 'NewYork,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/cloud-solutions-architect-remote-180-220k-new-york-ny-us-nigel-frank-international/220077254',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 11,
    company_name: 'shulmanflemingandpartners',
    job_title: 'seniorbackendengineer',
    location: '&nbsp;',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/senior-backend-engineer-us-shulman-fleming-partners/220116123',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 12,
    company_name: 'amritinformationtechnologysolutionsprivatelimited',
    job_title: 'seniorlevelpythondevelopers',
    location: 'Brooklyn,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/senior-level-python-developers-brooklyn-ny-us-amrit-information-technology-solutions-private-limited/220024765',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 13,
    company_name: 'westcoastconsultingllc',
    job_title: 'servicenowdeveloperwithsecops',
    location: 'Manhattan,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/servicenow-developer-with-secops-manhattan-ny-us-west-coast-consulting-llc/219829514',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 14,
    company_name: 'wellsfargobank',
    job_title: 'softwaresrengineer',
    location: 'Sewaren,NJ',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/software-sr-engineer-sewaren-nj-us-wells-fargo-bank/f78d1ee0-2d8e-4fd5-8658-c3ae409838d5',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 15,
    company_name: 'freshdirectllc',
    job_title: 'businessintelligencedeveloper',
    location: 'Bronx,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/business-intelligence-developer-bronx-ny-us-fresh-direct-llc/220115559',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 16,
    company_name: 'synechron',
    job_title: 'sr.javadeveloper/lead(microservices)_nyc',
    location: 'NewYorkCity,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/sr-java-developer-lead-microservices-nyc-new-york-city-ny-us-synechron/220255947',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 17,
    company_name: 'newyorkcityboardofelections',
    job_title: 'seniorcomputerprogrammer',
    location: 'NewYorkCity,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/senior-computer-programmer-new-york-city-ny-us-new-york-city-board-of-elections/213133725',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 18,
    company_name: 'capitalone',
    job_title: 'mastersoftwareengineer',
    location: 'SaintAlbans,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/master-software-engineer-saint-albans-ny-us-capital-one/9595191f-cce7-44fb-bd0b-1a835892e9c2',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 19,
    company_name: 'beaconhillstaffinggroup',
    job_title: 'sr.javaengineer',
    location: 'FranklinLakes,NJ',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/sr-java-engineer-franklin-lakes-nj-us-beacon-hill-staffing-group/220113500',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 20,
    company_name: 'quintrixsolutionsinc',
    job_title: 'entrylevelsoftwaredeveloper',
    location: 'NewYork,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/entry-level-software-developer-new-york-ny-us-quintrix-solutions-inc/220185001',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 21,
    company_name: 'symbiountechnologies',
    job_title: 'pythondeveloper',
    location: 'JerseyCity,NJ',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/python-developer-jersey-city-nj-us-symbioun-technologies/217778565',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 22,
    company_name: 'signifyhealth',
    job_title: 'seniorsoftwareengineer',
    location: 'Newark,NJ',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/senior-software-engineer-newark-nj-us-signify-health/f70ac8b6-4418-4355-8e3b-d963bf230cc3',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 23,
    company_name: 'arkhyatechinc',
    job_title: 'awsarchitctpositionatjerseycitynj',
    location: 'Jerseycity,NJ',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/aws-architct-position-at-jersey-city-nj-jersey-city-nj-us-arkhya-tech-inc/220018353',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 24,
    company_name: 'stratacent',
    job_title: 'pythondeveloper',
    location: 'JerseyCity,NJ',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/python-developer-jersey-city-nj-us-stratacent/220021118',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 25,
    company_name: 'removowl',
    job_title: 'softwareimplementationspecialist-newclientonboarding',
    location: 'TEANECK,NJ',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/software-implementation-specialist-new-client-onboarding-teaneck-nj-us-removowl/219911984',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 26,
    company_name: 'cognizant',
    job_title: 'seniorsoftwareengineer-fullstack',
    location: 'newYork,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/senior-software-engineer-full-stack-new-york-ny-us-cognizant/220275664',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 27,
    company_name: 'delveprofessionalsllc',
    job_title: 'salesforcedeveloper',
    location: 'Jerseycity,NJ,07097',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/salesforce-developer-jersey-city-nj-us-delve-professionals-llc/219910890',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 28,
    company_name: 'saiconconsultantsinc.',
    job_title: 'softwaretester(sdet)-41080remote',
    location: 'Woodside,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/software-tester-sdet-41080-remote-woodside-ny-us-saicon-consultants-inc/218829284',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 29,
    company_name: 'dpsearchassociatesinc',
    job_title: 'iosmobileapplicationdeveloper',
    location: 'LakeSuccess,NY,11040',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/ios-mobile-application-developer-lake-success-ny-us-dp-search-associates-inc/199570416',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 30,
    company_name: 'pritechnology',
    job_title: 'fullstackdeveloper',
    location: 'NewYorkCity,NY,10012',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/full-stack-developer-new-york-city-ny-us-pri-technology/220254192',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 31,
    company_name: 'discoverycommunications',
    job_title: 'softwaredevelopmentengineerii',
    location: 'NewYork,NY,10002',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/software-development-engineer-ii-new-york-ny-us-discovery-communications/bff66ed9-f2b3-482a-bf34-18324c418d18',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 32,
    company_name: 'bgcpartners',
    job_title: 'fullstackdeveloper',
    location: 'NewYork,NY,10001',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/full-stack-developer-new-york-ny-us-bgc-partners/220216668',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 33,
    company_name: 'eliassengroup',
    job_title: 'informaticadeveloper',
    location: 'NewYork,NY',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/informatica-developer-new-york-ny-us-eliassen-group/220179360',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  },
  {
    id: 34,
    company_name: 'teqlinx',
    job_title: 'pegadeveloper',
    location: 'JerseyCity,NJ',
    discover_date: new Date('2020-09-21T15:08:02.443Z'),
    job_board: 'monster',
    apply_url: 'https://job-openings.monster.com/pega-developer-jersey-city-nj-us-teqlinx/219923530',
    last_posting_date: new Date('2020-09-21T15:08:02.443Z'),
    inactive_date: null
  }
];

export {
  RAW_LISTINGS
};
