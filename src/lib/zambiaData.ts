/**
 * Official Geographical & Secondary Educational Hierarchy for Zambia
 * North Western University College of Health and Applied Sciences (NWUCHAS)
 */

export interface ZambiaProvinceData {
  province: string;
  districts: {
    district: string;
    schools: string[];
  }[];
}

export const ZAMBIA_GEOGRAPHY: ZambiaProvinceData[] = [
  {
    province: 'North-Western',
    districts: [
      {
        district: 'Kalumbila',
        schools: [
          'Solwezi Technical Secondary School',
          'Manyama Day Secondary School',
          'Lumwana Secondary School',
          'Kisasa Secondary School',
          'Jiwundu Secondary School',
          'Meheba Boarding Secondary School',
          'Mutanda Day Secondary School',
          'Mukumbi Secondary School',
        ],
      },
      {
        district: 'Solwezi',
        schools: [
          'Solwezi Technical Secondary School',
          'Solwezi Central Secondary School',
          'Kansanshi Secondary School',
          'Kyawama Secondary School',
          'Mushitala Secondary School',
          'Tumvwanganai Secondary School',
          'Kimikanga Secondary School',
          'St. Francis Catholic Secondary School',
        ],
      },
      {
        district: 'Kasempa',
        schools: [
          'Kasempa Boys Boarding Secondary School',
          'Mukinge Girls Mission Secondary School',
          'Kasempa Day Secondary School',
          'Ingwe Day Secondary School',
          'Nselauke Day Secondary School',
        ],
      },
      {
        district: 'Mwinilunga',
        schools: [
          'Mwinilunga Secondary School',
          'Sailunga Secondary School',
          'Kakoma Secondary School',
          'Ntambu Day Secondary School',
          'Kanyama Secondary School',
        ],
      },
      {
        district: 'Mufumbwe',
        schools: [
          'Mufumbwe Secondary School',
          'Lalafuta Secondary School',
          'Kamabuta Secondary School',
        ],
      },
      {
        district: 'Zambezi',
        schools: [
          'Zambezi Boarding Secondary School',
          'Chitokoloki Mission Secondary School',
          'Liyunyi Day Secondary School',
        ],
      },
      {
        district: 'Chavuma',
        schools: [
          'Chavuma Boarding Secondary School',
          'Sewe Day Secondary School',
          'Chivombo Secondary School',
        ],
      },
      {
        district: 'Kabompo',
        schools: [
          'Kabompo Secondary School',
          'Mumbeji Secondary School',
          'Kayombo Day Secondary School',
        ],
      },
      {
        district: 'Manyinga',
        schools: [
          'Manyinga Day Secondary School',
          'Loloma Mission Secondary School',
        ],
      },
      {
        district: 'Ikelenge',
        schools: [
          'Ikelenge Secondary School',
          'Sakeji Mission School',
          'Nyakaseya Secondary School',
        ],
      },
    ],
  },
  {
    province: 'Copperbelt',
    districts: [
      {
        district: 'Kitwe',
        schools: [
          'Kitwe Boys Secondary School',
          'Helen Kaunda Girls Secondary School',
          'Mindolo Secondary School',
          'Nkana Secondary School',
          'Chibuluma Secondary School',
          'Chamboli Secondary School',
          'Mukuba Secondary School',
          'Wusakile Secondary School',
        ],
      },
      {
        district: 'Ndola',
        schools: [
          'Ndola Technical High School',
          'Kansenshi Secondary School',
          'Fatima Girls Secondary School',
          'Masala Secondary School',
          'Temweni Secondary School',
          'Lubuto Secondary School',
          'Chiwala Technical Secondary School',
        ],
      },
      {
        district: 'Chingola',
        schools: [
          'Chingola Secondary School',
          'Kabundi Secondary School',
          'Chikola Secondary School',
          'Maiteneke Secondary School',
        ],
      },
      {
        district: 'Mufulira',
        schools: [
          'Mufulira Secondary School',
          'Kantanshi Secondary School',
          'Butondo Secondary School',
          'Ipusukilo Secondary School',
        ],
      },
      {
        district: 'Luanshya',
        schools: [
          'Luanshya Boys Secondary School',
          'Luanshya Girls Secondary School',
          'Mpelembe Secondary School',
          'Roan Secondary School',
        ],
      },
      {
        district: 'Kalulushi',
        schools: [
          'Kalulushi Secondary School',
          'St. Joseph Mission Secondary School',
          'Chibuluma Secondary School',
        ],
      },
      {
        district: 'Chililabombwe',
        schools: [
          'Chililabombwe Secondary School',
          'Kakoso Secondary School',
          'Konkola Secondary School',
        ],
      },
      {
        district: 'Lufwanyama',
        schools: [
          'Lufwanyama Boarding Secondary School',
          'St. Mary Mission Secondary School',
        ],
      },
      {
        district: 'Mpongwe',
        schools: [
          'Mpongwe Boarding Secondary School',
          'Ibenga Girls Secondary School',
        ],
      },
      {
        district: 'Masaiti',
        schools: [
          'Masaiti Boarding Secondary School',
          'Mishikishi Secondary School',
        ],
      },
    ],
  },
  {
    province: 'Lusaka',
    districts: [
      {
        district: 'Lusaka',
        schools: [
          'David Kaunda National Technical High School',
          'Kabulonga Boys Secondary School',
          'Kabulonga Girls Secondary School',
          'Munali Boys Secondary School',
          'Munali Girls Secondary School',
          'Matero Boys Secondary School',
          'Roma Girls Secondary School',
          'Kamwala Secondary School',
          'Libala Secondary School',
          'Chilenje Secondary School',
          'Twin Palm Secondary School',
        ],
      },
      {
        district: 'Chongwe',
        schools: [
          'Chongwe Secondary School',
          'Chalimbana Secondary School',
          'Kasisi Girls Secondary School',
        ],
      },
      {
        district: 'Kafue',
        schools: [
          'Kafue Boys Secondary School',
          'Naboye Secondary School',
          'Kafue Day Secondary School',
        ],
      },
      {
        district: 'Chilanga',
        schools: [
          'Chilanga Secondary School',
          'Mount Makulu Secondary School',
          'Parklands High School',
        ],
      },
      {
        district: 'Luangwa',
        schools: [
          'Luangwa Boarding Secondary School',
          'Feira Day Secondary School',
        ],
      },
      {
        district: 'Rufunsa',
        schools: [
          'Rufunsa Girls Technical Secondary School',
          'Chinyunyu Secondary School',
        ],
      },
    ],
  },
  {
    province: 'Central',
    districts: [
      {
        district: 'Kabwe',
        schools: [
          'Kabwe High School',
          'Bwacha Secondary School',
          'Stephen Luwisha Girls Secondary School',
          'Mukobeko Secondary School',
          'Rapids Secondary School',
        ],
      },
      {
        district: 'Kapiri Mposhi',
        schools: [
          'Kapiri Mposhi Secondary School',
          'Kapiri Girls Secondary School',
        ],
      },
      {
        district: 'Mkushi',
        schools: [
          'Mkushi High School',
          'Chengelo School',
          'Nkumbi International College Secondary',
        ],
      },
      {
        district: 'Serenje',
        schools: [
          'Serenje Boys Secondary School',
          'Malcolm Moffat Secondary School',
        ],
      },
      {
        district: 'Chibombo',
        schools: [
          'Chibombo Secondary School',
          'Liteta Secondary School',
        ],
      },
      {
        district: 'Chisamba',
        schools: [
          'Chisamba Secondary School',
          'Golden Valley Secondary School',
        ],
      },
    ],
  },
  {
    province: 'Southern',
    districts: [
      {
        district: 'Choma',
        schools: [
          'Choma Secondary School',
          'St. Mark Boys Secondary School',
          'Njase Girls Secondary School',
          'Macha Girls Secondary School',
        ],
      },
      {
        district: 'Livingstone',
        schools: [
          'Hillcrest National Technical Secondary School',
          'St. Mary Secondary School',
          'Livingstone Day Secondary School',
          'Linda Secondary School',
        ],
      },
      {
        district: 'Mazabuka',
        schools: [
          'Mazabuka Girls Secondary School',
          'St. Edmunds Secondary School',
          'Nakambala Secondary School',
        ],
      },
      {
        district: 'Monze',
        schools: [
          'Monze Secondary School',
          'Rusangu Secondary School',
          'St. Kizito Secondary School',
        ],
      },
      {
        district: 'Kalomo',
        schools: [
          'Kalomo Secondary School',
          'Namwianga Christian Secondary School',
        ],
      },
      {
        district: 'Namwala',
        schools: [
          'Namwala Secondary School',
          'Lubwe Secondary School',
        ],
      },
    ],
  },
  {
    province: 'Eastern',
    districts: [
      {
        district: 'Chipata',
        schools: [
          'Chizongwe Boys Secondary School',
          'St. Monica Girls Secondary School',
          'Chipata Day Secondary School',
          'Lutembwe Secondary School',
        ],
      },
      {
        district: 'Petauke',
        schools: [
          'Petauke Boarding Secondary School',
          'Nyimba Secondary School',
        ],
      },
      {
        district: 'Katete',
        schools: [
          'Katete Secondary School',
          'St. Francis Secondary School',
        ],
      },
      {
        district: 'Lundazi',
        schools: [
          'Lundazi Boarding Secondary School',
          'Lumezi Secondary School',
        ],
      },
    ],
  },
  {
    province: 'Northern',
    districts: [
      {
        district: 'Kasama',
        schools: [
          'Kasama Boys Secondary School',
          'Kasama Girls Secondary School',
          'Mungwi Technical Secondary School',
          'Luwingu Secondary School',
        ],
      },
      {
        district: 'Mbala',
        schools: [
          'Mbala Secondary School',
          'St. Paul Secondary School',
        ],
      },
      {
        district: 'Mpulungu',
        schools: [
          'Mpulungu Secondary School',
        ],
      },
    ],
  },
  {
    province: 'Luapula',
    districts: [
      {
        district: 'Mansa',
        schools: [
          'Mansa Secondary School',
          'Bahati Secondary School',
          'St. Clement Secondary School',
          'Mabumba Secondary School',
        ],
      },
      {
        district: 'Kawambwa',
        schools: [
          'Kawambwa Boys Secondary School',
          'St. Mary Girls Secondary School',
        ],
      },
      {
        district: 'Samfya',
        schools: [
          'Samfya Secondary School',
        ],
      },
    ],
  },
  {
    province: 'Western',
    districts: [
      {
        district: 'Mongu',
        schools: [
          'Kambule Boys Secondary School',
          'Holy Cross Girls Secondary School',
          'St. John Secondary School',
          'Sefula Secondary School',
        ],
      },
      {
        district: 'Kaoma',
        schools: [
          'Kaoma Secondary School',
        ],
      },
      {
        district: 'Sesheke',
        schools: [
          'Sesheke Secondary School',
        ],
      },
    ],
  },
  {
    province: 'Muchinga',
    districts: [
      {
        district: 'Chinsali',
        schools: [
          'Chinsali Girls Secondary School',
          'Robert Kapasa Makasa Secondary School',
        ],
      },
      {
        district: 'Mpika',
        schools: [
          'Mpika Boys Secondary School',
          'Lwitikila Girls Secondary School',
        ],
      },
      {
        district: 'Nakonde',
        schools: [
          'Nakonde Secondary School',
        ],
      },
    ],
  },
];

export const ALL_ZAMBIAN_PROVINCES = ZAMBIA_GEOGRAPHY.map((p) => p.province);

export function getDistrictsForProvince(provinceName: string): string[] {
  const found = ZAMBIA_GEOGRAPHY.find((p) => p.province.toLowerCase() === provinceName.toLowerCase());
  return found ? found.districts.map((d) => d.district) : [];
}

export function getSchoolsForDistrict(provinceName: string, districtName: string): string[] {
  const prov = ZAMBIA_GEOGRAPHY.find((p) => p.province.toLowerCase() === provinceName.toLowerCase());
  if (!prov) return [];
  const dist = prov.districts.find((d) => d.district.toLowerCase() === districtName.toLowerCase());
  return dist ? dist.schools : [];
}

/**
 * Calculates candidate age from a Date of Birth string (YYYY-MM-DD)
 */
export function calculateAge(dateOfBirth: string): { years: number; months: number; text: string } | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
    years--;
    months += 12;
  }

  return {
    years,
    months,
    text: `${years} yrs (${dob.toLocaleDateString('en-GB')})`,
  };
}
